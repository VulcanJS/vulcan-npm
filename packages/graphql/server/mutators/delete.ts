import { runCallbacks } from "@vulcanjs/core";

import { DeleteInput, VulcanGraphqlModelServer } from "../../typings";
import isEmpty from "lodash/isEmpty.js";
import { ContextWithUser } from "../resolvers/typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { restrictViewableFields } from "@vulcanjs/permissions";
import {
  getSelector,
  performMutationCheck,
  validateMutationData,
} from "./helpers";

interface DeleteMutatorCommonInput {
  model: VulcanGraphqlModelServer;
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
  const connector = model.crud.connector;
  if (!connector)
    throw new Error(
      `Model ${model.name} has no connector. Cannot delete document.`
    );
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
  const properties = {
    data: document,
    document,
    currentUser,
    model,
    schema,
    // legacy, only current user will be used
    context,
  };

  /* Validation */
  if (validate) {
    await validateMutationData({
      model,
      mutatorName,
      currentUser,
      properties,
    });
  }

  /* Run fields onDelete */
  for (let fieldName of Object.keys(schema)) {
    const { onDelete } = schema[fieldName];
    if (onDelete) {
      await onDelete(properties); // eslint-disable-line no-await-in-loop
    }
  }

  /* Before */
  document = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.before`,
    callbacks: model.crud?.callbacks?.[mutatorName]?.before || [],
    iterator: document,
    args: [properties],
  });

  /* DB Operation */
  await connector.delete(selector);

  /* After */
  document = await runCallbacks({
    hookName: `${typeName}.${mutatorName}.after`,
    callbacks: model.crud?.callbacks?.[mutatorName]?.after || [],
    iterator: document,
    args: [properties],
  });

  /* Async side effects, mutation won't wait for them to return. Use for analytics for instance */
  runCallbacks({
    hookName: `${model.graphql.typeName.toLowerCase()}.${mutatorName}.async`,
    callbacks: model.crud?.callbacks?.[mutatorName]?.async || [],
    args: [properties],
  });

  // filter out non readable fields if appliable
  if (!asAdmin) {
    document = restrictViewableFields(currentUser, model, document) as TModel;
  }

  return { data: document };
};
