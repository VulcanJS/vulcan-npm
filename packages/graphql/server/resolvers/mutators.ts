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

// import { runCallbacks, runCallbacksAsync } from "../modules/index.js";
import {
  validateDocument,
  validateData,
  modifierToData,
  dataToModifier,
} from "./validation";
// import { globalCallbacks } from "../modules/callbacks.js";
// import { registerSetting } from "../modules/settings.js";
// import { debug, debugGroup, debugGroupEnd } from "../modules/debug.js";
import { runCallbacks } from "../../callbacks";

import { throwError } from "./errors";
import { getModelConnector } from "./context";
import pickBy from "lodash/pickBy";
import clone from "lodash/clone";
import isEmpty from "lodash/isEmpty";
import { ContextWithUser } from "./typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { VulcanGraphqlModel } from "../../typings";
import { restrictViewableFields } from "../../permissions";

interface CreateMutatorInput {
  model: VulcanGraphqlModel;
  document?: VulcanDocument;
  data: VulcanDocument;
  context: ContextWithUser;
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
  let data: VulcanDocument = clone(originalData);

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

  const hookNameRoot = model.graphql.typeName.toLowerCase();
  const mutatorName = "create";
  /*

  Validation

  */
  if (validate) {
    let validationErrors = [];
    // simple schema validation
    validationErrors = validationErrors.concat(
      validateDocument(data, model, context),
      await runCallbacks({
        hookName: `${hookNameRoot}.${mutatorName}.validate`,
        iterator: validationErrors,
        callbacks: model?.graphql?.callbacks?.create?.validate || [],
        args: [properties],
      })
    );
    if (validationErrors.length) {
      throwError({
        id: "app.validation_error",
        data: { break: true, errors: validationErrors },
      });
    }
  }

  /* If user is logged in, check if userId field is in the schema and add it to document if needed */
  if (currentUser) {
    // TODO: clean this using "has"
    const userIdInSchema = Object.keys(schema).find((key) => key === "userId");
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
        // OpenCRUD backwards compatibility: keep both newDocument and data for now, but phase out newDocument eventually
        autoValue = await schema[fieldName].onCreate(properties); // eslint-disable-line no-await-in-loop
      }
      if (typeof autoValue !== "undefined") {
        data[fieldName] = autoValue;
      }
    } catch (e) {
      console.log(`// Autovalue error on field ${fieldName}`);
      console.log(e);
    }
  }
  /* Before */
  data = await runCallbacks({
    hookName: `${hookNameRoot}.${mutatorName}.before`,
    callbacks: model.graphql?.callbacks?.create?.before || [],
    iterator: data,
    args: [properties],
  });

  /* DB Operation */
  const connector = getModelConnector<TModel>(context, model);
  let document = await connector.create(model, data);

  /* After */
  document = await runCallbacks({
    hookName: `${hookNameRoot}.${mutatorName}.after`,
    callbacks: model.graphql?.callbacks?.create?.after || [],
    iterator: document,
    args: [properties],
  });

  /* Async side effects, mutation won't wait for them to return. Use for analytics for instance */
  runCallbacks({
    hookName: `${model.graphql.typeName.toLowerCase()}.create.async`,
    callbacks: model.graphql?.callbacks?.create?.async || [],
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
  context: ContextWithUser;
}

/*

Update

*/
export const updateMutator = async <TModel extends VulcanDocument>({
  model,
  dataId,
  selector,
  data,
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
  const { schema } = model;

  // get currentUser from context if possible
  if (!currentUser && context.currentUser) {
    currentUser = context.currentUser;
  }

  // OpenCRUD backwards compatibility
  selector = selector || { _id: dataId };
  data = { ...data } || modifierToData({ $set: set, $unset: unset });

  // startDebugMutator(collectionName, "Update", { selector, data });

  if (isEmpty(selector)) {
    throw new Error("Selector cannot be empty");
  }

  // get original document from database or arguments
  const connector = getModelConnector(context, model);
  const currentDocument = connector.findOne(model, selector);

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

  /*

  Validation

  */
  if (validate) {
    let validationErrors = [];

    validationErrors = validationErrors.concat(
      validateData(data, model, context)
    );
    //
    // new callback API (Oct 2019)
    // validationErrors = await runCallbacks({
    //   name: `${typeName.toLowerCase()}.update.validate`,
    //   callbacks: get(collection, "options.callbacks.update.validate", []),
    //   iterator: validationErrors,
    //   properties,
    // });
    // validationErrors = await runCallbacks({
    //   name: "*.update.validate",
    //   callbacks: get(globalCallbacks, "update.validate", []),
    //   iterator: validationErrors,
    //   properties,
    // });
    if (validationErrors.length) {
      console.log(validationErrors); // eslint-disable-line no-console
      throwError({
        id: "app.validation_error",
        data: { break: true, errors: validationErrors },
      });
    }
  }

  /*

  Run field onUpdate callbacks

  */
  for (let fieldName of Object.keys(schema)) {
    let autoValue;
    if (schema[fieldName].onUpdate) {
      autoValue = await schema[fieldName].onUpdate(properties); // eslint-disable-line no-await-in-loop
    }
    if (typeof autoValue !== "undefined") {
      data[fieldName] = autoValue;
    }
  }

  /*

  Before

  */
  // new callback API (Oct 2019)
  // data = await runCallbacks({
  //   name: `${typeName.toLowerCase()}.update.before`,
  //   callbacks: get(collection, "options.callbacks.update.before", []),
  //   iterator: data,
  //   properties,
  // });
  // data = await runCallbacks({
  //   name: "*.update.before",
  //   callbacks: get(globalCallbacks, "update.before", []),
  //   iterator: data,
  //   properties,
  // });

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
    document = await connector.update(model, selector, modifier, {
      removeEmptyStrings: false,
    });

    // TODO: add support for caching by other indexes to Dataloader
    // https://github.com/VulcanJS/Vulcan/issues/2000
    // clear cache if needed
    // if (selector.documentId && collection.loader) {
    //   collection.loader.clear(selector.documentId);
    // }
  }

  /*

  After

  // */
  // // new callback API (Oct 2019)
  // document = await runCallbacks({
  //   name: `${typeName.toLowerCase()}.update.after`,
  //   callbacks: get(collection, "options.callbacks.update.after", []),
  //   iterator: document,
  //   properties,
  // });
  // document = await runCallbacks({
  //   name: "*.update.after",
  //   callbacks: get(globalCallbacks, "update.after", []),
  //   iterator: document,
  //   properties,
  // });

  /*

  Async

  */
  // new callback API (Oct 2019)
  // await runCallbacksAsync({
  //   name: `${typeName.toLowerCase()}.update.async`,
  //   callbacks: get(collection, "options.callbacks.update.async", []),
  //   properties,
  // });
  // await runCallbacksAsync({
  //   name: "*.update.async",
  //   callbacks: get(globalCallbacks, "update.async", []),
  //   properties,
  // });

  // endDebugMutator(collectionName, "Update", { modifier });

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
  context: ContextWithUser;
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
  let document = await connector.findOne(model, selector);

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

  /*

  Validation

  */
  if (validate) {
    let validationErrors = [];
    //
    //     // new API (Oct 2019)
    //     validationErrors = await runCallbacks({
    //       name: `${typeName.toLowerCase()}.delete.validate`,
    //       callbacks: get(collection, "options.callbacks.delete.validate", []),
    //       iterator: validationErrors,
    //       properties,
    //     });
    //     validationErrors = await runCallbacks({
    //       name: "*.delete.validate",
    //       callbacks: get(globalCallbacks, "delete.validate", []),
    //       iterator: validationErrors,
    //       properties,
    //     });
    //
    if (validationErrors.length) {
      console.log(validationErrors); // eslint-disable-line no-console
      throwError({
        id: "app.validation_error",
        data: { break: true, errors: validationErrors },
      });
    }
  }

  /*

  Run fields onDelete

  */
  for (let fieldName of Object.keys(schema)) {
    if (schema[fieldName].onDelete) {
      await schema[fieldName].onDelete(properties); // eslint-disable-line no-await-in-loop
    }
  }

  /*

  Before

  */
  // new API (Oct 2019)
  // document = await runCallbacks({
  //   name: `${typeName.toLowerCase()}.delete.before`,
  //   callbacks: get(collection, "options.callbacks.delete.before", []),
  //   iterator: document,
  //   properties,
  // });
  // document = await runCallbacks({
  //   name: "*.delete.before",
  //   callbacks: get(globalCallbacks, "delete.before", []),
  //   iterator: document,
  //   properties,
  // });

  /*

  DB Operation

  */
  await connector.delete(model, selector);

  /*

  After

  */
  // new API (Oct 2019)
  // document = await runCallbacks({
  //   name: `${typeName.toLowerCase()}.delete.after`,
  //   callbacks: get(collection, "options.callbacks.delete.after", []),
  //   iterator: document,
  //   properties,
  // });
  // document = await runCallbacks({
  //   name: "*.delete.after",
  //   callbacks: get(globalCallbacks, "delete.after", []),
  //   iterator: document,
  //   properties,
  // });

  // TODO: add support for caching by other indexes to Dataloader
  // clear cache if needed
  // if (selector.documentId && collection.loader) {
  //   collection.loader.clear(selector.documentId);
  // }

  /*

  Async

  */
  // new API (Oct 2019)
  // await runCallbacksAsync({
  //   name: `${typeName.toLowerCase()}.delete.async`,
  //   callbacks: get(collection, "options.callbacks.delete.async", []),
  //   properties,
  // });
  // await runCallbacksAsync({
  //   name: "*.delete.async",
  //   callbacks: get(globalCallbacks, "delete.async", []),
  //   properties,
  // });
  // endDebugMutator(collectionName, "Delete");

  // filter out non readable fields if appliable
  if (!asAdmin) {
    document = restrictViewableFields(currentUser, model, document) as TModel;
  }

  return { data: document };
};
