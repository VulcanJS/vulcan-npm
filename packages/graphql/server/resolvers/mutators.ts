/*


Mutations have five steps:

1. Authorization

First we check if the user requesting the mutation has the authorization to do so.

2. Validation

If the mutator call is not trusted (for example, it comes from a GraphQL mutation),
we'll run all validate steps:

- Check that the current user has permission to insert/edit each field.
- Add userId to document (insert only).
- Run validation callbacks.

3. Before Callbacks

The third step is to run the mutation argument through all the [before] callbacks.

4. Operation

We then perform the insert/update/remove operation.

5. After Callbacks

We then run the mutation argument through all the [after] callbacks.

6. Async Callbacks

Finally, *after* the operation is performed, we execute any async callbacks.
Being async, they won't hold up the mutation and slow down its response time
to the client.

*/

import {
  validateData,
  modifierToData,
  dataToModifier
} from "./validation";
import { runCallbacks } from "@vulcanjs/core";

import { throwError } from "./errors";
import { ModelMutationPermissionsOptions } from "@vulcanjs/model";
import { isMemberOf } from "@vulcanjs/permissions";
import { getModelConnector } from "./context";
import { UpdateInput, DeleteInput, FilterableInput } from "../../typings";
import { deprecate } from "@vulcanjs/utils";
import clone from "lodash/clone";
import isEmpty from "lodash/isEmpty";
import { ContextWithUser } from "./typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { DefaultMutatorName, VulcanGraphqlModel } from "../../typings";
import { restrictViewableFields } from "@vulcanjs/permissions";

/**
 * Throws if some data are invalid
 */
const validateMutationData = async ({
  model,
  data,
  mutatorName,
  context,
  properties,
}: {
  model: VulcanGraphqlModel; // data model
  mutatorName: DefaultMutatorName;
  context: Object; // Graphql context
  properties: Object; // arguments of the callback, can vary depending on the mutator
  data?: any; // data to validate
  validationFunction?: Function;
}): Promise<void> => {
  const { typeName } = model.graphql;
  // basic simple schema validation
  const simpleSchemaValidationErrors = validateData({ document: data, model, context, mutatorName });
  // custom validation
  const customValidationErrors = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.validate`,
    iterator: [],
    callbacks: model?.graphql?.callbacks?.[mutatorName]?.validate || [],
    args: [properties],
  });
  const validationErrors = [
    ...simpleSchemaValidationErrors,
    ...customValidationErrors,
  ];
  if (validationErrors.length) {
    throwError({
      id: "app.validation_error",
      data: { break: true, errors: validationErrors },
    });
  }
};

type OperationName = "create" | "update" | "delete";
const operationChecks: {
  [operationName in OperationName]: keyof ModelMutationPermissionsOptions;
} = {
  create: "canCreate",
  update: "canUpdate",
  delete: "canDelete",
};

interface MutationCheckOptions {
  user?: any;
  document?: VulcanDocument;
  model: VulcanGraphqlModel;
  operationName: OperationName;
  asAdmin?: boolean
}

/*

Perform security check

*/
export const performMutationCheck = (options: MutationCheckOptions) => {
  const { user, document, model, operationName, asAdmin = false } = options;
  const { typeName } = model.graphql;
  const permissionsCheck = model.permissions?.[operationChecks[operationName]];
  let allowOperation = false;
  const fullOperationName = `${typeName}:${operationName}`;
  const documentId = document?._id;
  const data = { documentId, operationName: fullOperationName };
  // 1. if no permission has been defined, throw error
  if (!permissionsCheck) {
    throwError({ id: "app.no_permissions_defined", data });
  }
  // 2. if no document is passed, throw error
  if (!document) {
    throwError({ id: "app.document_not_found", data });
  }

  if (!asAdmin && typeof permissionsCheck === "function") {
    allowOperation = permissionsCheck(options);
  } else if (!asAdmin && Array.isArray(permissionsCheck)) {
    allowOperation = isMemberOf(user, permissionsCheck, document);
  }
  // 3. if permission check is defined but fails, disallow operation
  if (!asAdmin && !allowOperation) {
    throwError({ id: "app.operation_not_allowed", data });
  }
};

interface GetSelectorInput {
  context: ContextWithUser,
  model: VulcanGraphqlModel,
  dataId?: string,
  selector?: Object,
  input?: FilterableInput<VulcanDocument>
}

async function getSelector({ dataId, selector, input, context, model }: GetSelectorInput
) {
  if (dataId) {
    selector = { _id: dataId };
  } else if (selector) {
    deprecate('0.2.3',
      "'selector' attribute of mutators is deprecated, use 'input' instead"
    );
    selector = selector;
  } else if (input) {
    const connector = getModelConnector(context, model);
    const filterParameters = await connector._filter(input, context);
    selector = filterParameters.selector;
  }
  return selector;
}

interface CreateMutatorInput {
  model: VulcanGraphqlModel;
  document?: VulcanDocument;
  data: VulcanDocument;
  context?: ContextWithUser;
  currentUser?: any; // allow to impersonate an user from server directly
  asAdmin?: boolean; // bypass security checks like field restriction
  validate?: boolean; // run validation, can be bypassed when calling from a server
}

/*

Create

*/
export const createMutator = async <TModel extends VulcanDocument>({
  model,
  data: originalData,
  currentUser,
  validate,
  asAdmin,
  context = {},
}: CreateMutatorInput): Promise<{ data: TModel }> => {
  // we don't want to modify the original document
  let data: Partial<TModel> = clone(originalData) as TModel;

  const { schema } = model;

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  const properties = {
    data,
    originalData,
    currentUser,
    model,
    context,
    schema,
  };

  const { typeName } = model.graphql;
  const mutatorName = "create";

  /* Authorization */
  performMutationCheck({
    user: currentUser,
    document: data,
    model,
    operationName: "create",
    asAdmin
  });

  /* Validation */
  if (validate) {
    await validateMutationData({
      model,
      data,
      mutatorName,
      context,
      properties,
    });
  }

  /* If userId field is missing in the document, add it if user is logged in */
  if (!data.userId && schema.hasOwnProperty('userId') && currentUser) {
    data.userId = currentUser._id;
  }
  /* 
  
  Field callback onCreate

  note: cannot use forEach with async/await. 
  See https://stackoverflow.com/a/37576787/649299

  note: clone arguments in case callbacks modify them

  */
  for (let fieldName of Object.keys(schema)) {
    try {
      let autoValue;
      // TODO: run for nested
      if (schema[fieldName].onCreate) {
        // TS is triggering an error for unknown reasons because there is already an if
        // @ts-expect-error Cannot invoke an object which is possibly 'undefined'.
        autoValue = await schema[fieldName].onCreate(properties); // eslint-disable-line no-await-in-loop
      }
      if (typeof autoValue !== "undefined") {
        data[fieldName as keyof TModel] = autoValue;
      }
    } catch (e) {
      console.log(`// Autovalue error on field ${fieldName}`);
      console.log(e);
    }
  }
  /* Before */
  data = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.before`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.before || [],
    iterator: data,
    args: [properties],
  });

  /* DB Operation */
  const connector = getModelConnector<TModel>(context, model);
  let document = await connector.create(data);

  /* After */
  document = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.after`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.after || [],
    iterator: document,
    args: [properties],
  });

  /* Async side effects, mutation won't wait for them to return. Use for analytics for instance */
  runCallbacks({
    hookName: `${typeName}.${mutatorName}.async`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.async || [],
    args: [properties],
  });

  if (!asAdmin) {
    document = restrictViewableFields(currentUser, model, document) as TModel;
  }
  return { data: document };
};

interface UpdateMutatorCommonInput {
  model: VulcanGraphqlModel;
  data?: VulcanDocument;
  set?: Object;
  unset?: Object;
  currentUser?: any;
  validate?: boolean;
  asAdmin?: boolean;
  context?: ContextWithUser;
}

/*

Update
Accepts a document reference by id, Vulan input or selector (deprecated, use input instead).

*/
export const updateMutator = async <TModel extends VulcanDocument>({
  model,
  dataId,
  selector,
  input,
  data: dataInput,
  set,
  // FIXME: babel does build, probably because "set" is reserved
  // set = {},
  unset = {},
  currentUser,
  validate,
  asAdmin,
  context = {},
}: UpdateMutatorCommonInput & (
  { dataId: string, selector?: undefined, input?: undefined } |
  { selector: Object, dataId?: undefined, input?: undefined } |
  { input: UpdateInput<VulcanDocument>, dataId?: undefined, selector?: undefined }
)): Promise<{ data: TModel }> => {

  set = set || {};
  const { typeName } = model.graphql;
  const mutatorName = "update";
  const { schema } = model;
  let data = { ...dataInput } || modifierToData({ $set: set, $unset: unset });

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  // get selector from the right input
  dataId = dataId || input?.id || data?._id
  selector = await getSelector({ dataId, selector, input, context, model });
  // this shouldn't be reachable
  if (isEmpty(selector)) {
    throw new Error("Selector cannot be empty, please give an id or a proper input");
  }

  // get original document from database or arguments
  const connector = getModelConnector(context, model);
  const currentDocument = await connector.findOne(selector);

  /* Authorization */
  performMutationCheck({
    user: currentUser,
    document: currentDocument,
    model,
    operationName: "update",
    asAdmin
  });

  if (!currentDocument) {
    throw new Error(
      `Could not find document to update for selector: ${JSON.stringify(
        selector
      )}`
    );
  }

  /*

  Properties

  */
  const properties = {
    data,
    originalData: clone(data),
    originalDocument: currentDocument,
    currentUser,
    model,
    context,
    schema,
  };

  /* Validation */
  if (validate) {
    await validateMutationData({
      model,
      data,
      mutatorName,
      context,
      properties,
    });
  }

  /*

  Run field onUpdate callbacks

  */
  for (let fieldName of Object.keys(schema)) {
    let autoValue;
    if (schema[fieldName].onUpdate) {
      // TS is triggering an error for unknown reasons because there is already an if
      // @ts-expect-error Cannot invoke an object which is possibly 'undefined'.
      autoValue = await schema[fieldName].onUpdate(properties); // eslint-disable-line no-await-in-loop
    }
    if (typeof autoValue !== "undefined") {
      data[fieldName] = autoValue;
    }
  }

  /* Before */
  data = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.before`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.before || [],
    iterator: data,
    args: [properties],
  });

  // update connector requires a modifier, so get it from data
  const modifier = dataToModifier(data);

  // remove empty modifiers
  if (isEmpty(modifier.$set)) {
    delete modifier.$set;
  }
  if (isEmpty(modifier.$unset)) {
    delete modifier.$unset;
  }

  /*

  DB Operation

  */
  let document;
  if (!isEmpty(modifier)) {
    // update document
    // and get fresh copy of document from db
    document = await connector.update(selector, modifier, {
      removeEmptyStrings: false,
    });

    // TODO: add support for caching by other indexes to Dataloader
    // https://github.com/VulcanJS/Vulcan/issues/2000
    // clear cache if needed
    // if (selector.documentId && collection.loader) {
    //   collection.loader.clear(selector.documentId);
    // }
  }

  /* After */
  document = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.after`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.after || [],
    iterator: document,
    args: [properties],
  });

  /* Async side effects, mutation won't wait for them to return. Use for analytics for instance */
  runCallbacks({
    hookName: `${model.graphql.typeName.toLowerCase()}.${mutatorName}.async`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.async || [],
    args: [properties],
  });

  // filter out non readable fields if appliable
  if (!asAdmin) {
    document = restrictViewableFields(currentUser, model, document) as TModel;
  }

  return { data: document };
};

interface DeleteMutatorCommonInput {
  model: VulcanGraphqlModel;
  currentUser?: any;
  context?: ContextWithUser;
  validate?: boolean;
  asAdmin?: boolean;
}
/*

Delete
Accepts a document reference by id, Vulan input or selector (deprecated, use input instead).

*/
export const deleteMutator = async <TModel extends VulcanDocument>({
  model,
  dataId,
  selector,
  input,
  currentUser,
  validate,
  asAdmin,
  context = {},
}: DeleteMutatorCommonInput & (
  { dataId: string, selector?: undefined, input?: undefined } |
  { selector: Object, dataId?: undefined, input?: undefined } |
  { input: DeleteInput, dataId?: undefined, selector?: undefined }
)): Promise<{ data: TModel }> => {

  const mutatorName = "delete";
  const { typeName } = model.graphql;
  const { schema } = model;

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  // get selector from the right input
  dataId = dataId || input?.id
  selector = await getSelector({ dataId, selector, input, context, model });
  // this shouldn't be reachable
  if (isEmpty(selector)) {
    throw new Error("Selector cannot be empty, please give an id or a proper input");
  }

  // get document from database
  const connector = getModelConnector<TModel>(context, model);
  let document = await connector.findOne(selector);

  /* Authorization */
  performMutationCheck({
    user: currentUser,
    document,
    model,
    operationName: "delete",
    asAdmin
  });

  if (!document) {
    throw new Error(
      `Could not find document to delete for selector: ${JSON.stringify(
        selector
      )}`
    );
  }

  /*

  Properties

  */
  const properties = { document, currentUser, model, context, schema };

  /* Validation */
  if (validate) {
    await validateMutationData({
      model,
      mutatorName,
      context,
      properties,
    });
  }

  /* Run fields onDelete */
  for (let fieldName of Object.keys(schema)) {
    if (schema[fieldName].onDelete) {
      // TS is triggering an error for unknown reasons because there is already an if
      // @ts-expect-error Cannot invoke an object which is possibly 'undefined'.
      await schema[fieldName].onDelete(properties); // eslint-disable-line no-await-in-loop
    }
  }

  /* Before */
  document = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.before`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.before || [],
    iterator: document,
    args: [properties],
  });

  /* DB Operation */
  await connector.delete(selector);

  /* After */
  document = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.after`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.after || [],
    iterator: document,
    args: [properties],
  });

  /* Async side effects, mutation won't wait for them to return. Use for analytics for instance */
  runCallbacks({
    hookName: `${model.graphql.typeName.toLowerCase()}.${mutatorName}.async`,
    callbacks: model.graphql?.callbacks?.[mutatorName]?.async || [],
    args: [properties],
  });

  // filter out non readable fields if appliable
  if (!asAdmin) {
    document = restrictViewableFields(currentUser, model, document) as TModel;
  }

  return { data: document };
};
