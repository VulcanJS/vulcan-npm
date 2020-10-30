/**
 * Finalize the graphql schema creation by adding
 * common elements to the model-based schema
 */
import { VulcanGraphqlModel } from "../typings";
import { parseAllModels } from "./parseAllModels";
import { defaultTypeDefs, defaultResolvers } from "./defaultSchema";
import { mergeResolvers } from "./utils";

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
  return {
    resolvers: mergedResolvers,
    typeDefs: mergedTypeDefs,
  };
};
