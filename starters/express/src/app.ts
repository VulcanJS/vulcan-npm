/**
 * Inspired by existing Vulcan Next graphql API route
 *
 * DONE
 * - Setup a GraphQL endpoint with a fake Mongo db
 * - Demo setup with Vercel serverless deployment (not recommended)
 *
 * TODO 2022/04 to reach beta release:
 * - show how to setup the graphql context properly
 * - show how to setup permissions via currentUser context
 * - easy swap of the mongo database
 * - automatically add _id, userId, timestamps in models
 * - get rid of escape-string-regex issue
 * - Support caching when connecting to Mongo (to allow serverless approach)
 */
import mongoose from "mongoose";
import express, { Request } from "express";
// import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

import {
  buildApolloSchema,
  createContext,
  createDataSources,
} from "@vulcanjs/graphql/server";

import {
  addDefaultMongoConnector,
  objectIdTypeDefs,
  objectIdResolvers,
} from "@vulcanjs/mongo-apollo/server";

import http from "http";

import { startMongo, closeMongo } from "./inMemoryMongo";
import { models } from "./models";
import { seedDemoDb } from "./seedDemoDb";

// Graphql resolvers and typedefs
const vulcanRawSchema = buildApolloSchema(models);
// Executable graphq schema
const vulcanSchema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([
    objectIdTypeDefs,
    vulcanRawSchema.typeDefs,
    /** Add your custom resolvers here if needed */
  ]),
  resolvers: mergeResolvers([
    objectIdResolvers,
    vulcanRawSchema.resolvers,
    /** Add your custom resolvers here if needed */
  ]),
});

// Will add relevant data sources and connectors if necessary
// Using Mongo as a default
// /!\ Must be called before graphql context creation
addDefaultMongoConnector(models, {
  mongooseInstance: mongoose,
  /* useStringId: true // uncomment to use string ids */
});
const contextForModels = createContext(models);
const dataSourcesForModels = createDataSources(models);

const app = express();

// When running on Vercel, no need to setup a public folder in Express,
// just having a public folder at the root works
if (!process.env.VERCEL) {
  app.use(express.static("public"));
}

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
    plugins: [
      // If you prefer Playground:
      // @see https://www.apollographql.com/docs/apollo-server/api/plugin/landing-pages/
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageLocalDefault({
            includeCookies: true,
            // Removed the need for a complex CORS/cookies configuration, Apollo Studio runs in localhost
            embed: true,
          }),
    ],
    formatError: (err) => {
      // This function is mandatory to log error messages, even in development
      // You may enhance this function, eg by plugging an error tracker like Sentry in production
      console.error(err);
      return err;
    },
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

// Needed for Vercel deployment
export default app;
