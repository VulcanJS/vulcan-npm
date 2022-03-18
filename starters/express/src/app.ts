/**
 * Inspired by existing Vulcan Next graphql API route
 */
import express, { Request } from "express";
// import cors from "cors";
import mongoose from "mongoose";
import { ApolloServer, gql } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
import {
  buildDefaultQueryResolvers,
  createGraphqlModelServer,
  buildApolloSchema,
  createContext,
  createDataSources,
} from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { addDefaultMongoConnector } from "@vulcanjs/mongo-apollo";

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
/**
 * Demo model
 * 
 * Try this query for example:
 * 
 * query contribs {
  contributors {
    results {
      name
      myself {
        name
      }
    }
  }
}
 */
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
    // Virtual field that queries the contributor itself
    // This is just a dumb demo for dataSources
    myselfVirtual: {
      type: String,
      canRead: ["guests"],
      canCreate: [],
      canUpdate: [],
      resolveAs: {
        fieldName: "myself",
        typeName: "Contributor",
        resolver: async (root /*: ContributorDocument*/, args, context) => {
          return await context.dataSources["Contributor"].findOneById(root._id);
        },
      },
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
const contributorConnector = createMongooseConnector(Contributor, {
  // Passing an instance is only needed in local development or if you have multiple mongoose connections
  // Otherwise the default export of "mongoose" is always the default connection
  mongooseInstance: mongoose,
});
Contributor.graphql.connector = contributorConnector;
//await mongoose.models["contributors"].deleteMany();
const models = [Contributor];
// Will add relevant data sources where necessary
addDefaultMongoConnector(models);

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
  await contributorConnector.delete({});
  await contributorConnector.create({ name: "John Doe" });
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
