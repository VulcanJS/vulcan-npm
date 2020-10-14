/**
 * Generates the Graphql schema
 * (in the form of a string template)
 *
 * Previously was the main GraphQL object
 */
import { IExecutableSchemaDefinition } from "apollo-server";
import deepmerge from "deepmerge";
import GraphQLJSON from "graphql-type-json";
import GraphQLDate from "graphql-date";
import { disableFragmentWarnings } from "graphql-tag";

import parseModel from "./parseModel";
import { TopLevelResolverMap } from "./typings";
import { VulcanGraphqlModel } from "../typings";

disableFragmentWarnings();

const defaultResolvers = {
  JSON: GraphQLJSON,
  Date: GraphQLDate,
};

/**
 * Merge top level resolvers for each model into a big resolver
 * @param resolversList
 */
const mergeResolvers = (
  resolversList: Array<Partial<TopLevelResolverMap>>
): TopLevelResolverMap => {
  return resolversList.reduce(
    (mergedResolvers, currentResolver) =>
      deepmerge(mergedResolvers, currentResolver),
    {}
  ) as TopLevelResolverMap;
};

// TODO: parse all models and return the whole schema
export const parseAllModels = (
  models: Array<VulcanGraphqlModel>
): IExecutableSchemaDefinition<any> => {
  // register the generated resolvers
  // schemaResolvers.forEach(addGraphQLResolvers);
  const parsedModels = models.map(parseModel);
  const mergedTypeDefs = parsedModels.map((m) => m.typeDefs).join();
  const resolvers = parsedModels.map((m) => m.resolvers);
  const schemaResolvers = parsedModels.map((m) => m.schemaResolvers);
  const mergedResolvers = mergeResolvers([
    defaultResolvers,
    ...resolvers,
    ...schemaResolvers,
  ]);
  return {
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    // TODO: we might need other options?
  };
};
