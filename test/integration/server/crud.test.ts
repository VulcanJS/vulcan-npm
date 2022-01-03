/**
 * Inspired by existing Vulcan Next graphql API route
 */
import express, { Request } from "express";
// import cors from "cors";
import mongoose from "mongoose";
import { ApolloServer, gql } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
// import { mergeSchemas } from "@graphql-tools/schema";
import { buildApolloSchema } from "@vulcanjs/graphql/server";

// import mongoConnection from "~/api/middlewares/mongoConnection";
// import corsOptions from "~/api/cors";
// import { contextFromReq } from "~/api/context";

import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
import { contextFromReq } from "./utils/context";
import { buildDefaultQueryResolvers } from "@vulcanjs/graphql/server";
import { createGraphqlModelServer } from "@vulcanjs/graphql/server";

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

const Contributor = createGraphqlModelServer({
  name: "Contributor",
  schema: {
    _id: {
      type: String,
      canRead: ["guests"],
      canCreate: ["guests"],
      canUpdate: ["guests"],
      canDelete: ["guests"],
    },
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
  },
});
// Work in progress
describe("crud operations", () => {
  test("setup an apollo 3 server", async () => {
    const models = [Contributor];
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
  });
  test("run multi query with filter", async () => {
    const models = [Contributor];
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

    //

    const res = await server.executeOperation({
      query: gql`
        query {
          contributors(
            input: {
              filter: { _and: [{ _id: { _eq: "61ccb24e536dde646bdb3080" } }] }
            }
          ) {
            results {
              _id
            }
          }
        }
      `,
    });
    expect(res.errors).toBeUndefined();
    expect(res.data).toEqual({ contributors: { results: [] } });
  });
});
