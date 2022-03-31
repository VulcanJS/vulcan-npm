/**
 * Inspired by existing Vulcan Next graphql API route
 */
import express, { Request } from "express";
// import cors from "cors";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";

import {
  buildApolloSchema,
  createContext,
  createDataSources,
} from "@vulcanjs/graphql/server";
import { addDefaultMongoConnector } from "@vulcanjs/mongo-apollo";

import http from "http";

import { startMongo, closeMongo } from "./inMemoryMongo";
import { Contributor, models } from "./models";

// Will add relevant data sources and connectors if necessary
// Using Mongo as a default
addDefaultMongoConnector(models);

// Graphql resolvers and typedefs
const vulcanRawSchema = buildApolloSchema(models);
// Executable graphq schema
const vulcanSchema = makeExecutableSchema(vulcanRawSchema);

const contextForModels = createContext(models);
const dataSourcesForModels = createDataSources(models);
// Demo Apollo server
const startServer = async () => {
  // Define the server (using Express for easier middleware usage)
  const server = new ApolloServer({
    schema: vulcanSchema,
    context: async ({ req }) => ({
      // will generate context used by Vulcan default resolvers
      ...(await contextForModels(req as Request)),
      // add your own custom context here
    }),
    dataSources: () => ({
      // will generate dataSources used by Vulcan default resolvers
      ...dataSourcesForModels(),
      // add your own data sources here
    }),
    introspection: process.env.NODE_ENV === "development", //false,
    //playground: false,
  });
  await server.start();

  const app = express();
  const httpServer = http.createServer(app);

  // app.set("trust proxy", true);
  server.applyMiddleware({ app, path: "/api/graphql" });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 3000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`);
};

const seedDb = async () => {
  // insert some dummy data just for testing
  console.log("Seeding...");
  /**
   * NOTE: calling the mongoose model directly WON'T run
   * the model callbacks.
   *
   * You may instead want to use a "mutator"
   */
  const contributorMongooseModel = mongoose.models[Contributor.name];
  await contributorMongooseModel.remove({});
  await contributorMongooseModel.create({ name: "John Doe" });
  console.log("Done seeding db with 1 contributor");
};
const start = async () => {
  await startMongo();
  await seedDb();
  await startServer();
};

start();

process.on("SIGINT", closeMongo);
process.on("exit", closeMongo);
