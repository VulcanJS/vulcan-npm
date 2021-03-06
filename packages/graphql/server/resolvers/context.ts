/**
 * Helpers for the graphql context
 */
import { VulcanDocument } from "@vulcanjs/schema";
import { VulcanGraphqlModel } from "../../typings";
import { Connector } from "./connector";

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
  if (!context[typeName]) {
    throw new Error(
      `No model found in the GraphQL context for typeName ${typeName}`
    );
  }
  if (!context[typeName]?.model) {
    throw new Error(
      `TypeName ${typeName} found in the GraphQL context but it doesn't contain a "model" field.`
    );
  }
  return context[typeName].model;
};
