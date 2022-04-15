import { runCallbacks } from "@vulcanjs/core";

import { VulcanGraphqlModelServer } from "../../typings";
import cloneDeep from "lodash/cloneDeep.js";
import { ContextWithUser } from "../resolvers/typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { restrictViewableFields } from "@vulcanjs/permissions";
import {
  CreateMutatorProperties,
  performMutationCheck,
  validateMutationData,
} from "./helpers";

interface CreateMutatorInput {
  model: VulcanGraphqlModelServer;
  document?: VulcanDocument;
  data: VulcanDocument;
  context?: ContextWithUser;
  currentUser?: any; // allow to impersonate an user from server directly
  asAdmin?: boolean; // bypass security checks like field restriction
  validate?: boolean; // run validation, can be bypassed when calling from a server
}
/**
 * Create a new object
 *
 * Will run permissions check, and callbacks tied to a model
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

  const properties: CreateMutatorProperties = {
    document: data,
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
      const onCreate = schema[fieldName].onCreate;
      if (onCreate) {
        autoValue = await onCreate(properties); // eslint-disable-line no-await-in-loop
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
  const connector = model.graphql.connector;
  if (!connector)
    throw new Error(
      `Model ${model.name} has no connector. Cannot create a document.`
    );
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
