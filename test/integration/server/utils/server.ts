import { promises } from "fs";
import path from "path";
const { writeFile } = promises;
import { VulcanGraphqlModel } from "@vulcanjs/graphql";
import express, { Request } from "express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { buildApolloSchema } from "@vulcanjs/graphql/server";
import { contextFromReq } from "./context";
import { ApolloServer } from "apollo-server-express";

import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { objectIdTypeDefs, objectIdResolvers } from "@vulcanjs/mongo-apollo";

// Demo Apollo server
export const makeApolloServer = async (models: Array<VulcanGraphqlModel>) => {
  const vulcanRawSchema = buildApolloSchema(models);
  const mergedSchema = {
    // order matters (Vulcan will use Mongo typedefs, and your custom typedefs might use Vulcan etc.)
    typeDefs: mergeTypeDefs([objectIdTypeDefs, vulcanRawSchema.typeDefs]),
    resolvers: mergeResolvers([objectIdResolvers, vulcanRawSchema.resolvers]),
  };
  //await writeFile(
  //  path.resolve(__dirname, "./typeDefs.gql"),
  //  vulcanRawSchema.typeDefs
  //);

  const vulcanSchema = makeExecutableSchema(mergedSchema);

  // Define the server (using Express for easier middleware usage)
  const server = new ApolloServer({
    schema: vulcanSchema,
    context: ({ req }) => contextFromReq(models)(req as Request),
    introspection: false,
    //playground: false,
  });
  await server.start();
  const app = express();
  // app.set("trust proxy", true);
  server.applyMiddleware({ app, path: "/api/graphql" });
  return server;
};
