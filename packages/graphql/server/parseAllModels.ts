/**
 * Generates the Graphql schema
 * (in the form of a string template)
 *
 * Previously was the main GraphQL object
 */
import { disableFragmentWarnings } from "graphql-tag";

import parseModel from "./parseModel";
import { VulcanGraphqlModel } from "../typings";
import { mergeResolvers } from "graphql-tools";
import _flatten from "lodash/flatten";

disableFragmentWarnings();

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
  const queryTypeDefs = _flatten(parsedModels.map((m) => m.queries));
  const mutationTypeDefs = _flatten(parsedModels.map((m) => m.mutations));
  const modelsTypeDefs = parsedModels.map((m) => m.typeDefs).join();
  const mergedTypeDefs = `${modelsTypeDefs}

${queryTypeDefs}

${mutationTypeDefs}`;

  const resolvers = parsedModels.map((m) => m.resolvers);
  // schema resolvers are a list of map of resolvers, so we need an additional merge step
  const schemaResolvers = parsedModels.map((m) =>
    mergeResolvers(m.schemaResolvers)
  );
  const mergedResolvers = mergeResolvers([...resolvers, ...schemaResolvers]);
  return {
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    // TODO: we might need other options?
  };
};
