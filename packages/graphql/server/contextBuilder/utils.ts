/**
 * Helpers for the graphql context
 *
 * NOTE: they should barely be used in end applications,
 */
import { Connector } from "@vulcanjs/crud/server";
import { VulcanDocument } from "@vulcanjs/schema";
import { VulcanGenericDataSource } from "./typings";
import type { VulcanGraphqlModel } from "../../typings";
import type { VulcanGraphqlModelServer } from "../typings";

const printModelName = (model: VulcanGraphqlModel) =>
  `Model of name ${model.name} ${
    model.name !== model.graphql.typeName
      ? `and typeName ${model.graphql.typeName}`
      : undefined
  }`;

/**
 * Get data source from the context.
 * @param context
 * @param model
 * @returns
 */
export const getModelDataSource = <TModel extends VulcanDocument>(
  context,
  model: VulcanGraphqlModel
): VulcanGenericDataSource => {
  if (!context.dataSources)
    throw new Error(
      "DataSources not set in Apollo. You need to set at least the default dataSources for Vulcan graphql models."
    );
  const dataSource =
    // model.name is the default but we fallback to typeName just in case
    context.dataSource[model.name] ||
    context.dataSources[model.graphql.typeName];
  if (!dataSource) {
    throw new Error(`${printModelName(model)} have no default dataSource.`);
  }
  return dataSource;
};

// INTERNAL

// These methods are only needed for default resolvers, that cannot directly depend
// on the models. For your own resolvers, use either a DataSource or import the model and its connector directly.

/**
 * We expect the connectors to be already in the context
 *
 * This function is just an helper to retrieve it
 *
 * NOTE: you are not supposed to use this in an end application.
 * Instead, directly import your model and its connector.
 * @param context
 * @param model
 */
export const getModelConnector = <TModel extends VulcanDocument>(
  context,
  model: VulcanGraphqlModel
): Connector<TModel> => {
  const modelContext = context[model.name] || context[model.graphql.typeName];
  if (!modelContext) {
    throw new Error(`${printModelName(model)} not found in Graphql context`); // TODO: unify error messages
  }
  if (!modelContext.connector) {
    throw new Error(
      `${printModelName(
        model
      )} found in Graphql context but connector is not defined`
    ); // TODO: unify error messages
  }
  return modelContext.connector;
};

/**
 * Get the model from graphql context (helps avoiding circular dependencies)
 * @param typeName The model typeName
 */
export const getModel = (
  context,
  typeName: string
): VulcanGraphqlModelServer => {
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
