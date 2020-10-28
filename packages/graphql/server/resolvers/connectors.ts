/**
 * We expect the connectors to be already in the context
 *
 * This function is just an helper to retrieve it
 * @param context
 * @param model
 */

import { VulcanModel } from "@vulcanjs/model";
import { Connector } from "./typings";

export const getModelConnector = <TModel>(
  context,
  model: VulcanModel
): Connector<TModel> => {
  if (!context[model.name]) {
    throw new Error(`Model ${model.name} not found in Graphql context`); // TODO: unify error messages
  }
  if (!context[model.name].connector) {
    throw new Error(
      `Model ${model.name} found in Graphql context but connector is not defined`
    ); // TODO: unify error messages
  }
  return context[model.name].connector;
};
