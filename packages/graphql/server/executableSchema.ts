/**
 * Finalize the graphql schema creation
 */

import { makeExecutableSchema } from "apollo-server";
import { mergeSchemas } from "graphql-tools";
import { REPL_MODE_SLOPPY } from "repl";
import { VulcanGraphqlModel } from "../typings";
import { generateGraqhqlSchema } from "./graphql";
import generateTypeDefs from "./typedefs";

// TODO: we probably don't need this anymore
// INstead, compute the schema for all models in graphql.ts
const initGraphQL = (models: Array<VulcanGraphqlModel>): void => {
  // TODO: merge all models
  const { resolvers, queries, mutations, typeDefs } = model
  const typeDefs = generateTypeDefs({
    additionalTypeDefs: GraphQLSchema.getAdditionalSchemas(),
    modelTypeDefs: GraphQLSchema.getCollectionsSchemas(),
    queries: GraphQLSchema.queries,
    mutations: GraphQLSchema.mutations,
  });

  const executableSchema = makeExecutableSchema({
    typeDefs,
    resolvers: GraphQLSchema.resolvers,
    schemaDirectives: GraphQLSchema.directives,
  });
  // only call mergeSchemas if we actually have stitchedSchemas
  // const mergedSchema =
  //   GraphQLSchema.stitchedSchemas.length > 0
  //     ? mergeSchemas({
  //         schemas: [executableSchema, ...GraphQLSchema.stitchedSchemas],
  //       })
  //     : executableSchema;
// 
  return executableSchema,
};

export default initGraphQL;
