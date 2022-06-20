/**
 * Inspired by existing Vulcan Next graphql API route
 *
 * TODO 2022/04 to reach beta release:
 * - show how to setup the graphql context properly
 * - show how to setup permissions via currentUser context
 * - easy swap of the mongo database
 * - automatically add _id, userId, timestamps in models
 * - get rid of escape-string-regex issue
 */
import mongoose from "mongoose";
import express, { Request } from "express";
// import cors from "cors";
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
import { models } from "./models";
import { seedDemoDb } from "./seedDemoDb";

// Graphql resolvers and typedefs
const vulcanRawSchema = buildApolloSchema(models);
// Executable graphq schema
const vulcanSchema = makeExecutableSchema(vulcanRawSchema);

// Will add relevant data sources and connectors if necessary
// Using Mongo as a default
// /!\ Must be called before graphql context creation
addDefaultMongoConnector(models, { mongooseInstance: mongoose });
const contextForModels = createContext(models);
const dataSourcesForModels = createDataSources(models);

const app = express();
// Redirection so the home page points to graphql directly
app.get("/", (req, res) => {
  res.redirect("/api/graphql");
});

// Demo Apollo server
const startServer = async () => {
  // Define the server (using Express for easier middleware usage)
  const server = new ApolloServer({
    schema: vulcanSchema,
    csrfPrevention: true,
    cache: "bounded",
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
  });
  await server.start();

  const httpServer = http.createServer(app);

  // app.set("trust proxy", true);
  server.applyMiddleware({ app, path: "/api/graphql" });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 3000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`);
};

const start = async () => {
  await startMongo();
  await seedDemoDb();
  await startServer();
};

start();

process.on("SIGINT", closeMongo);
process.on("exit", closeMongo);
