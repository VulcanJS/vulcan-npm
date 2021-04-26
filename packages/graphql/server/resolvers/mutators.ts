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
  validateDocument,
  validateData,
  modifierToData,
  dataToModifier,
} from "./validation";
import { runCallbacks } from "../../callbacks";

import { throwError } from "./errors";
import { getModelConnector } from "./context";
import pickBy from "lodash/pickBy";
import clone from "lodash/clone";
import isEmpty from "lodash/isEmpty";
import { ContextWithUser } from "./typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { DefaultMutatorName, VulcanGraphqlModel } from "../../typings";
import { restrictViewableFields } from "../../permissions";

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
  validationFunction,
}: {
  model: VulcanGraphqlModel; // data model
  mutatorName: DefaultMutatorName;
  context: Object; // Graphql context
  properties: Object; // arguments of the callback, can vary depending on the mutator
  data?: any; // data to validate
  validationFunction?: Function;
}): Promise<void> => {
  const { typeName } = model.graphql;
  // basic simple schema validatio
  const simpleSchemaValidationErrors = data
    ? validationFunction
      ? validationFunction(data, model, context) // for update, we use validateData instead of validateDocument
      : validateDocument(data, model, context)
    : []; // delete mutator has no data, so we skip the simple schema validation
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
  let data: Partial<TModel> = clone(originalData);

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

  /* If user is logged in, check if userId field is in the schema and add it to document if needed */
  if (currentUser) {
    // TODO: clean this using "has"
    const userIdInSchema = "userId" in schema;
    if (!!userIdInSchema && !data.userId) data.userId = currentUser._id;
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

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  // OpenCRUD backwards compatibility
  // TODO: what can we remove?
  selector = selector || { _id: dataId };
  let data = { ...dataInput } || modifierToData({ $set: set, $unset: unset });

  // startDebugMutator(collectionName, "Update", { selector, data });

  if (isEmpty(selector)) {
    throw new Error("Selector cannot be empty");
  }

  // get original document from database or arguments
  const connector = getModelConnector(context, model);
  const currentDocument = await connector.findOne(selector);

  if (!currentDocument) {
    throw new Error(
      `Could not find document to update for selector: ${JSON.stringify(
        selector
      )}`
    );
  }

  // get a "preview" of the new, updated document
  let updatedDocument = { ...currentDocument, ...data };
  // remove null fields
  updatedDocument = pickBy(updatedDocument, (f) => f !== null);

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
      validationFunction: validateData, // TODO: update uses validateData instead of validateDocument => why?
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
  selector: Object;
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

  if (isEmpty(selector)) {
    throw new Error("Selector cannot be empty");
  }

  const connector = getModelConnector<TModel>(context, model);

  // get document from database
  let document = await connector.findOne(selector);

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
