/**
 * Helpers for the graphql context
 */
import { VulcanDocument } from "@vulcanjs/schema";
import { VulcanGraphqlModel } from "../../typings";
import { Connector } from "./typings";

/**
 * We expect the connectors to be already in the context
 *
 * This function is just an helper to retrieve it
 * @param context
 * @param model
 */
export const getModelConnector = <TModel extends VulcanDocument>(
  context,
  model: VulcanGraphqlModel
): Connector<TModel> => {
  if (!context[model.graphql.typeName]) {
    throw new Error(
      `Model of typeName ${model.graphql.typeName} not found in Graphql context`
    ); // TODO: unify error messages
  }
  if (!context[model.graphql.typeName].connector) {
    throw new Error(
      `Model ${model.graphql.typeName} found in Graphql context but connector is not defined`
    ); // TODO: unify error messages
  }
  return context[model.graphql.typeName].connector;
};

/**
 * Get the model from graphql context (helps avoiding circular dependencies)
 * @param typeName The model typeName
 */
export const getModel = (context, typeName: string): VulcanGraphqlModel => {
  return context[typeName].model;
};
