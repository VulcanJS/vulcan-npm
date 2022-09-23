/**
 * Inspired by existing Vulcan Next graphql API route
 */
// import cors from "cors";
// import { mergeSchemas } from "@graphql-tools/schema";
import mongoose from "mongoose";
import fetch from "cross-fetch";
import { multiQuery, MultiVariables } from "@vulcanjs/graphql";

// import mongoConnection from "~/api/middlewares/mongoConnection";
// import corsOptions from "~/api/cors";
// import { contextFromReq } from "~/api/context";

import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
import { buildDefaultQueryResolvers } from "@vulcanjs/graphql/server";
import { createGraphqlModelServer } from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { MongoId } from "@vulcanjs/mongo-apollo";
import { makeApolloServer } from "../server/utils/server";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// Init an in-memory Mongo server
let mongod;
let mongoUri;
beforeAll(async () => {
  // Spin up a dummy mongo server
  mongod = await MongoMemoryServer.create();
  mongoUri = mongod.getUri();
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

// Demo models
const Contributor = createGraphqlModelServer({
  name: "Contributor",
  schema: {
    _id: {
      type: String,
      typeName: MongoId,
      optional: true,
      canRead: ["anyone"],
      canCreate: ["anyone"],
      canUpdate: ["anyone"],
      //canDelete: ["guests"],
    },
    name: {
      type: String,
      optional: true,
      canRead: ["anyone"],
      canCreate: ["anyone"],
      canUpdate: ["anyone"],
      //canDelete: ["guests"],
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
    canRead: ["anyone"],
    canCreate: ["anyone"],
  },
});
const Repository = createGraphqlModelServer({
  name: "Repository",
  schema: {
    _id: {
      type: String,
      typeName: MongoId,
      optional: true,
      canRead: ["anyone"],
      canCreate: ["anyone"],
      canUpdate: ["anyone"],
      //canDelete: ["guests"],
    },
    userId: {
      type: String,
      typeName: MongoId,
      optional: true,
      canRead: ["anyone"],
    },
    name: {
      type: String,
      optional: true,
      canRead: ["anyone"],
      canCreate: ["anyone"],
      canUpdate: ["anyone"],
      //canDelete: ["guests"],
    },
    contributorId: {
      type: String,
      typeName: MongoId,
      // You will be able to query the "contributor" field of any "repository" object
      relation: {
        fieldName: "contributor",
        kind: "hasOne",
        model: Contributor,
      },
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],
    },
  },
  graphql: {
    typeName: "Repository",
    multiTypeName: "Repositories",
  },
  permissions: {
    canRead: ["anyone"],
    canCreate: ["anyone"],
  },
});
const contributorConnector = createMongooseConnector(Contributor);
const contributorMongooseModel = contributorConnector.getRawCollection();
Contributor.crud.connector = contributorConnector;
const repositoryConnector = createMongooseConnector(Contributor);
Repository.crud.connector = repositoryConnector;

// Drop the data
beforeEach(async () => {
  await mongoose.models[Contributor.name]?.remove({});
  await mongoose.models[Repository.name]?.remove({});
});
afterEach(async () => {
  await mongoose.models[Contributor.name]?.remove({});
  await mongoose.models[Repository.name]?.remove({});
});

const models = [Contributor, Repository];
test("filter by regex", async () => {
  const { server, app } = await makeApolloServer(models);
  const contributor = await contributorMongooseModel.create({ name: "John" });
  const contributor2 = await contributorMongooseModel.create({ name: "Jim" });

  const httpServer = app.listen();
  const gqlUri = `http://localhost:${
    (httpServer.address() as any).port
  }/api/graphql`;

  try {
    const client = new ApolloClient({
      link: new HttpLink({ uri: gqlUri, fetch }),
      uri: gqlUri,
      cache: new InMemoryCache(),
    });
    const res = await client.query({
      query: multiQuery({ model: Contributor }),
      variables: {
        input: {
          filter: {
            name: {
              _like: "John",
            },
          },
        },
      } as MultiVariables,
    });
    expect(res.data).toMatchObject({
      contributors: { results: [{ name: "John" }] },
    });
  } finally {
    httpServer.close();
  }
});
