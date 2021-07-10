/*


Mutations have five steps:

1. Validation

If the mutator call is not trusted (for example, it comes from a GraphQL mutation),
we'll run all validate steps:

- Check that the current user has permission to insert/edit each field.
- Add userId to document (insert only).
- Run validation callbacks.

2. Before Callbacks

The second step is to run the mutation argument through all the [before] callbacks.

3. Operation

We then perform the insert/update/remove operation.

4. After Callbacks

We then run the mutation argument through all the [after] callbacks.

5. Async Callbacks

Finally, *after* the operation is performed, we execute any async callbacks.
Being async, they won't hold up the mutation and slow down its response time
to the client.

*/

import {
  validateDatas,
  modifierToData,
  dataToModifier
} from "./validation";
import { runCallbacks } from "@vulcanjs/core";

import { throwError } from "./errors";
import { ModelMutationPermissionsOptions } from "@vulcanjs/model";
import { isMemberOf } from "@vulcanjs/permissions";
import { getModelConnector } from "./context";
import pickBy from "lodash/pickBy";
import clone from "lodash/clone";
import isEmpty from "lodash/isEmpty";
import { ContextWithUser } from "./typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { DefaultMutatorName, VulcanGraphqlModel } from "../../typings";
import { restrictViewableFields } from "@vulcanjs/permissions";

interface CreateMutatorInput {
  model: VulcanGraphqlModel;
  document?: VulcanDocument;
  data: VulcanDocument;
  context?: ContextWithUser;
  currentUser?: any; // allow to impersonate an user from server directly
  asAdmin?: boolean; // bypass security checks like field restriction
  validate?: boolean; // run validation, can be bypassed when calling from a server
}

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
  const simpleSchemaValidationErrors = validateDatas({document: data, model, context, mutatorName});
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
  context: any;
  operationName: OperationName;
}

/*

Perform security check

*/
export const performMutationCheck = (options: MutationCheckOptions) => {
  const { user, document, model, context, operationName } = options;
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

  if (typeof permissionsCheck === "function") {
    allowOperation = permissionsCheck(options);
  } else if (Array.isArray(permissionsCheck)) {
    allowOperation = isMemberOf(user, permissionsCheck, document);
  }

  // 3. if permission check is defined but fails, disallow operation
  if (!allowOperation) {
    throwError({ id: "app.operation_not_allowed", data });
  }
};

interface GetIdOrSelectorInput {
  selector?: Object;
  _id?: string;
}
// OpenCRUD backwards compatibility
/**
 * Allows to use the mutator with just a dataId instead of using the selector like in defaultMutationResolvers.
 * Needs at least one non-empty argument
 */
const getIdOrSelector = async ({ selector, _id }: GetIdOrSelectorInput) => {
  return isEmpty(_id) ? selector : { _id };
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

  /* Autorization */
  if (!asAdmin) {
    performMutationCheck({
      user: currentUser,
      document: data,
      model,
      context,
      operationName: "create",
    });
  }

  /* If user is logged in, check if userId field is in the schema and add it to document if needed */
  if (currentUser) {
    if (schema.hasOwnProperty('userId') && !data.userId) data.userId = currentUser._id;
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

interface UpdateMutatorInput {
  model: VulcanGraphqlModel;
  selector?: Object;
  data?: VulcanDocument;
  dataId?: string;
  set?: Object;
  unset?: Object;
  currentUser?: any;
  validate?: boolean;
  asAdmin?: boolean;
  context?: ContextWithUser;
}

/*

Update

*/
export const updateMutator = async <TModel extends VulcanDocument>({
  model,
  dataId,
  selector,
  data: dataInput,
  set,
  // FIXME: babel does build, probably because "set" is reserved
  // set = {},
  unset = {},
  currentUser,
  validate,
  asAdmin,
  context = {},
}: UpdateMutatorInput): Promise<{ data: TModel }> => {
  set = set || {};
  const { typeName } = model.graphql;
  const mutatorName = "update";
  const { schema } = model;
  let data = { ...dataInput } || modifierToData({ $set: set, $unset: unset });

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  selector = await getIdOrSelector({ selector, _id: dataId });
  if (isEmpty(selector)) {
    throw new Error("Selector cannot be empty, please give an id or a proper selector");
  }

  // get original document from database or arguments
  const connector = getModelConnector(context, model);
  const currentDocument = await connector.findOne(selector);

  /* Autorization */
  if (!asAdmin) {
    performMutationCheck({
      user: currentUser,
      document: currentDocument,
      model,
      context,
      operationName: "update",
    });
  }

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

interface DeleteMutatorInput {
  model: VulcanGraphqlModel;
  selector?: Object;
  dataId?: string;
  currentUser?: any;
  context?: ContextWithUser;
  validate?: boolean;
  asAdmin?: boolean;
}
/*

Delete

*/
export const deleteMutator = async <TModel extends VulcanDocument>({
  model,
  dataId,
  selector,
  currentUser,
  validate,
  asAdmin,
  context = {},
}: DeleteMutatorInput): Promise<{ data: TModel }> => {
  const mutatorName = "delete";
  const { typeName } = model.graphql;
  const { schema } = model;

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  selector = await getIdOrSelector({ selector, _id: dataId });
  if (isEmpty(selector)) {
    throw new Error("Selector cannot be empty");
  }

  // get document from database
  const connector = getModelConnector<TModel>(context, model);
  let document = await connector.findOne(selector);

  /* Autorization */
  if (!asAdmin) {
    performMutationCheck({
      user: currentUser,
      document,
      model,
      context,
      operationName: "delete",
    });
  }

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
