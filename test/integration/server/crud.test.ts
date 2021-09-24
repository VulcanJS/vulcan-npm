/**
 * Inspired by existing Vulcan Next graphql API route
 */
import express, { Request } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { ApolloServer, gql } from "apollo-server-express";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { buildApolloSchema } from "@vulcanjs/graphql";

// import mongoConnection from "~/api/middlewares/mongoConnection";
// import corsOptions from "~/api/cors";
// import { contextFromReq } from "~/api/context";

import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
import { contextFromReq } from "./utils/context";
import { buildDefaultQueryResolvers } from "@vulcanjs/graphql";
import { createGraphqlModelServer } from "@vulcanjs/graphql";

let mongod;
let mongoUri;
beforeAll(async () => {
  // Spin up a dummy mongo server
  mongod = new MongoMemoryServer();
  mongoUri = await mongod.getUri();
  // const port = await mongod.getPort();
  // const dbPath = await mongod.getDbPath();
  // const dbName = await mongod.getDbName();
  // Connect mongoose client
  await mongoose.connect(mongoUri);
});
afterAll(async () => {
  // remove the collection
  // disconnect the client
  await mongoose.disconnect();
  // stop mongo server
  await mongod.stop();
});

describe("crud operations", () => {
  test("setup an apollo server", () => {
    const models = [
      createGraphqlModelServer({
        name: "Contributor",
        schema: {
          _id: {
            type: String,
            canRead: ["guests"],
          },
        },
        graphql: {
          typeName: "Contributor",
          multiTypeName: "Contributors",
          queryResolvers: buildDefaultQueryResolvers({
            typeName: "Contributor",
          }),
        },
      }),
    ];
    const vulcanRawSchema = buildApolloSchema(models);
    const vulcanSchema = makeExecutableSchema(vulcanRawSchema);

    // Define the server (using Express for easier middleware usage)
    const server = new ApolloServer({
      schema: vulcanSchema,
      context: ({ req }) => contextFromReq(models)(req as Request),
      introspection: false,
      playground: false,
    });

    const app = express();
    // app.set("trust proxy", true);
    server.applyMiddleware({ app, path: "/api/graphql" });
  });
});
