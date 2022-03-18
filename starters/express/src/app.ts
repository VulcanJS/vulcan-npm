/**
 * Inspired by existing Vulcan Next graphql API route
 */
import express, { Request } from "express";
// import cors from "cors";
import mongoose from "mongoose";
import { ApolloServer, gql } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeSchemas } from "@graphql-tools/schema";

import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
import { createContext } from "./utils/context";
import { createDataSources } from "./utils/dataSources";
import {
  buildDefaultQueryResolvers,
  createGraphqlModelServer,
  buildApolloSchema,
} from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";

import http from "http";

// Init an in-memory Mongo server
// TODO: use a real db like in Vulcan Next
let mongod;
let mongoUri;
const startMongo = async () => {
  // Spin up a dummy mongo server
  mongod = await MongoMemoryServer.create();
  mongoUri = mongod.getUri();
  console.log("MongoUri", mongoUri);
  // const port = await mongod.getPort();
  // const dbPath = await mongod.getDbPath();
  // const dbName = await mongod.getDbName();
  // Connect mongoose client
  await mongoose.connect(mongoUri);
};
const closeMongo = async () => {
  console.log("Exiting, close Mongo connection");
  // remove the collection
  // disconnect the client
  await mongoose.disconnect();
  console.log("Disconneced mongoose");
  // stop mongo server
  await mongod.stop();
  console.log("Closed connection");
  process.exit(0);
};

// Demo model
const Contributor = createGraphqlModelServer({
  name: "Contributor",
  schema: {
    _id: {
      type: String,
      optional: true,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
      //canDelete: ["guests"],
    },
    name: {
      type: String,
      optional: true,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
      //canDelete: ["guests"],
    },
    // TODO: add resolved field using data source
  },
  graphql: {
    typeName: "Contributor",
    multiTypeName: "Contributors",
    queryResolvers: buildDefaultQueryResolvers({
      typeName: "Contributor",
    }),
  },
  permissions: {
    canRead: ["guests"],
    canCreate: ["guests"],
  },
});
const contributorConnector = createMongooseConnector(Contributor);
Contributor.graphql.connector = contributorConnector;
const models = [Contributor];

// Graphql schema
const vulcanRawSchema = buildApolloSchema(models);
const vulcanSchema = makeExecutableSchema(vulcanRawSchema);

const contextForModels = createContext(models);
const dataSourcesForModels = createDataSources(models);
// Demo Apollo server
const startServer = async () => {
  // Define the server (using Express for easier middleware usage)
  const server = new ApolloServer({
    schema: vulcanSchema,
    context: ({ req }) => contextForModels(req as Request),
    dataSources: () => dataSourcesForModels(),
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

const start = async () => {
  await startMongo();
  await startServer();
};

start();

process.on("SIGINT", closeMongo);
process.on("exit", closeMongo);
