/*


Mutators have following steps:

1. Authorization
First we check if the document exists and if the user requesting the mutation has the authorization to do so.

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

import { validateData, modifierToData, dataToModifier } from "./validation";
import { runCallbacks } from "@vulcanjs/core";

import { throwError } from "./errors";
import { ModelMutationPermissionsOptions } from "@vulcanjs/model";
import { isMemberOf } from "@vulcanjs/permissions";
import { getModelConnector } from "./context";
import { UpdateInput, DeleteInput, FilterableInput } from "../../typings";
import { deprecate } from "@vulcanjs/utils";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import { ContextWithUser } from "./typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { DefaultMutatorName, VulcanGraphqlModel } from "../../typings";
import { restrictViewableFields } from "@vulcanjs/permissions";
import { Options } from "graphql/utilities/extendSchema";

/**
 * Throws if some data are invalid
 */
const validateMutationData = async ({
  model,
  data,
  originalDocument,
  mutatorName,
  context,
  properties,
}: {
  model: VulcanGraphqlModel; // data model
  mutatorName: DefaultMutatorName;
  context: Object; // Graphql context
  properties: Object; // arguments of the callback, can vary depending on the mutator
  data?: any; // data to validate
  originalDocument?: VulcanDocument;
  validationFunction?: Function;
}): Promise<void> => {
  const { typeName } = model.graphql;
  // basic simple schema validation
  const simpleSchemaValidationErrors = validateData({
    document: data,
    originalDocument,
    model,
    context,
    mutatorName,
  });
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
  document?: VulcanDocument | null;
  model: VulcanGraphqlModel;
  operationName: OperationName;
  asAdmin?: boolean;
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
  context: ContextWithUser;
  model: VulcanGraphqlModel;
  dataId?: string;
  selector?: Object;
  input?: FilterableInput<VulcanDocument>;
}

/**
 * Get the selector, in the format that matches the relevant connector
 * (for instance Mongo)
 * @param param0
 * @returns
 */
async function getSelector({
  dataId,
  selector,
  input,
  context,
  model,
}: GetSelectorInput) {
  if (dataId) {
    selector = { _id: dataId };
  } else if (selector) {
    deprecate(
      "0.2.3",
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
  let data: Partial<TModel> = cloneDeep(originalData) as TModel;

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
    asAdmin,
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
  if (!data.userId && schema.hasOwnProperty("userId") && currentUser) {
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
  /**
   * Using a "set" syntax
   * @deprecated
   */
  set?: Object;
  /**
   * Using an "unset" syntax
   * @deprecated
   */
  unset?: Object;
  /**
   * User that triggered the update request
   * Set to null only if the update request is triggered by the app itself
   * Example where you can set it to null or undefined: seeding data
   */
  currentUser?: any;
  /**
   * Should validate the data
   *
   * NEVER SET IT TO FALSE if the input comes from an user request!
   * @default true
   */
  validate?: boolean;
  /**
   * Set asAdmin to true when the update is controlled by the application
   * Example: seeding data
   *
   * NEVER SET IT TO TRUE if the input comes from an user request!
   * @default false
   */
  asAdmin?: boolean;
  context?: ContextWithUser;
}

interface DataIdInput {
  dataId: string;
  data: VulcanDocument; // you must pass data at the root in this case
  // do not use the other fields to avoid ambiguity
  selector?: undefined;
  input?: undefined;
}
interface SelectorInput {
  /**
   * Selector must be in the connector format
   * Eg a Mongo selector
   * @deprecated Use input or dataId instead
   */
  selector: Object;
  data: VulcanDocument; // you must pass data at the root in this case
  // do not use the other fields to avoid ambiguity
  dataId?: undefined;
  input?: undefined;
}
interface VulcanInput {
  /**
   * Vulcan input
   *
   * Data represents the fields to update:
   * - id will be used to find the right document (you cannot update the id of a document)
   * - Fields that are not listed are left untouched
   * - Fields with value "null" will be unset from the document
   * - Fields with a non-null value will be updated
   *
   * @example { data: { id: 42, fieldToUpdate: "bar", fieldToRemove: null}}
   */
  input: UpdateInput<VulcanDocument>;
  dataId?: undefined;
  selector?: undefined;
  data?: undefined; // data are passed through the input in this case
}
export type UpdateMutatorInput = UpdateMutatorCommonInput &
  (DataIdInput | VulcanInput | SelectorInput);

/*

Update
Accepts a document reference by id, or Vulcan input

Using a Mongo selector directly is deprecated, use an input instead.

*/
export const updateMutator = async <TModel extends VulcanDocument>({
  model,
  dataId: dataIdFromArgs,
  selector: selectorFromArgs,
  input,
  data: dataFromRoot,
  set: setFromArgs = {},
  unset = {},
  currentUser,
  validate,
  asAdmin,
  context = {},
}: UpdateMutatorInput): Promise<{ data: TModel }> => {
  const { typeName } = model.graphql;
  const mutatorName = "update";
  const { schema } = model;
  let data;
  if (input) {
    data = cloneDeep(input.data); // normal case when using the useUpdate hook/default update resolver
  } else {
    // passing data directly (eg when calling the mutator manually)
    data = cloneDeep(dataFromRoot);
    // same but with set/unset modifiers
    if (!data) data = modifierToData({ $set: setFromArgs, $unset: unset });
  }

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  // get Mongo selector from the right input
  const dataId = dataIdFromArgs || input?.id || data?._id;
  const selector = await getSelector({
    dataId,
    selector: selectorFromArgs,
    input,
    context,
    model,
  });
  // this shouldn't be reachable
  if (isEmpty(selector)) {
    throw new Error(
      "Selector cannot be empty, please give an id or a proper input"
    );
  }

  // get original document from database or arguments
  const connector = getModelConnector(context, model);
  const foundCurrentDocument = await connector.findOne(selector);

  /* Authorization */
  performMutationCheck({
    user: currentUser,
    document: foundCurrentDocument,
    model,
    operationName: "update",
    asAdmin,
  });
  // PerformMutationCheck will already check that the document has been found, we can cast safely
  let currentDocument = foundCurrentDocument as TModel;

  /*

  Properties

  */
  const properties = {
    data,
    originalData: cloneDeep(data),
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
      originalDocument: currentDocument,
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
  dataId: dataIdFromArgs,
  selector: selectorFromArgs,
  input,
  currentUser,
  validate,
  asAdmin,
  context = {},
}: DeleteMutatorCommonInput &
  (
    | { dataId: string; selector?: undefined; input?: undefined }
    | {
        /**
         * Custom selector (eg Mongo)
         * @deprecated Use Vulcan input instead
         */
        selector: Object;
        dataId?: undefined;
        input?: undefined;
      }
    | { input: DeleteInput; dataId?: undefined; selector?: undefined }
  )): Promise<{ data: TModel }> => {
  const mutatorName = "delete";
  const { typeName } = model.graphql;
  const { schema } = model;

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  // get selector from the right input
  const dataId = dataIdFromArgs || input?.id;
  const selector = await getSelector({
    dataId,
    selector: selectorFromArgs,
    input,
    context,
    model,
  });
  // this shouldn't be reachable
  if (isEmpty(selector)) {
    throw new Error(
      "Selector cannot be empty, please give an id or a proper input"
    );
  }

  // get document from database
  const connector = getModelConnector<TModel>(context, model);
  let foundDocument = await connector.findOne(selector);

  /* Authorization
  Will also check if document is defined
  */
  performMutationCheck({
    user: currentUser,
    document: foundDocument,
    model,
    operationName: "delete",
    asAdmin,
  });
  // Force a cast because performMutationCheck will validate the document existence
  let document = foundDocument as TModel;

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
