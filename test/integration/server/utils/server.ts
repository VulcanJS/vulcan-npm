import { VulcanGraphqlModel } from "@vulcanjs/graphql";
import express, { Request } from "express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { buildApolloSchema } from "@vulcanjs/graphql/server";
import { contextFromReq } from "./context";
import { ApolloServer, gql } from "apollo-server-express";

// Demo Apollo server
export const makeApolloServer = async (models: Array<VulcanGraphqlModel>) => {
  const vulcanRawSchema = buildApolloSchema(models);
  const vulcanSchema = makeExecutableSchema(vulcanRawSchema);

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
