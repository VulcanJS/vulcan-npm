/**
 * Finalize the graphql schema creation by adding
 * common elements to the model-based schema
 */
import { VulcanGraphqlModel } from "../typings";
import { parseAllModels } from "./parseAllModels";
import { defaultTypeDefs, defaultResolvers } from "./defaultSchema";
import { mergeResolvers } from "./utils";
import isEmpty from "lodash/isEmpty";

export const buildApolloSchema = (
  models: Array<VulcanGraphqlModel>
): {
  typeDefs: string;
  resolvers: any;
} /*IExecutableSchemaDefinition<any>*/ => {
  // TODO: merge all models
  const { resolvers, typeDefs } = parseAllModels(models);
  const mergedTypeDefs = `${defaultTypeDefs}
${typeDefs}`;
  const mergedResolvers = mergeResolvers([defaultResolvers, resolvers]);
  // Special case if there are no Query or Mutation content
  if (isEmpty(mergedResolvers.Query)) delete mergedResolvers.Query;
  if (isEmpty(mergedResolvers.Mutation)) delete mergedResolvers.Mutation;

  return {
    resolvers: mergedResolvers,
    typeDefs: mergedTypeDefs,
  };
};
