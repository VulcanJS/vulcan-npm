/**
 * Generates the Graphql schema
 * (in the form of a string template)
 *
 * Previously was the main GraphQL object
 */

// Won't work (05/2022) because we treat graphql-tag as an external during build due to
// https://github.com/evanw/esbuild/issues/1921,
// Which in turns makes it a CJS import
//import { disableFragmentWarnings } from "graphql-tag";
import gql from "graphql-tag";

import parseModel from "./parseModel";
import { VulcanGraphqlModel } from "../typings";
// import { mergeResolvers } from "graphql-tools"; // not very useful + can cause issues
import { mergeResolvers } from "./utils";
import _flatten from "lodash/flatten.js";
import { generateQueryTypeDefs, generateMutationTypeDefs } from "./typedefs";
import {
  ModelResolverMap,
  TopLevelResolverMap,
  QueryTypeDefinition,
  MutationTypeDefinition,
} from "./typings";

gql.disableFragmentWarnings();

// TODO: parse all models and return the whole schema
export const parseAllModels = (
  models: Array<VulcanGraphqlModel>
): {
  typeDefs: string;
  resolvers: any;
} /*IExecutableSchemaDefinition<any>*/ => {
  // register the generated resolvers
  // schemaResolvers.forEach(addGraphQLResolvers);
  const parsedModels = models.map(parseModel);
  // typedefs
  const queryTypeDefinitions = _flatten(
    parsedModels.map((m) => m.queries).filter((q) => !!q)
  ) as QueryTypeDefinition[];
  const mutationTypeDefinitions = _flatten(
    parsedModels.map((m) => m.mutations).filter((m) => !!m)
  ) as MutationTypeDefinition[];
  const modelsTypeDefs = parsedModels.map((m) => m.typeDefs).join();
  const mergedTypeDefs = `${modelsTypeDefs}

${generateQueryTypeDefs(queryTypeDefinitions)}

${generateMutationTypeDefs(mutationTypeDefinitions)}`;

  const resolvers = parsedModels
    .map((m) => m.resolvers)
    .filter((r) => !!r) as ModelResolverMap[];
  // schema resolvers are a list of map of resolvers, so we need an additional merge step
  const schemaResolvers = parsedModels
    .map((model) => model.schemaResolvers)
    .filter((sr) => !!sr) // remove undefined values
    .map((schemaResolvers) =>
      mergeResolvers(schemaResolvers as Partial<TopLevelResolverMap>[])
    );

  const mergedResolvers = mergeResolvers([...resolvers, ...schemaResolvers]);
  return {
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    // TODO: we might need other options?
  };
};
