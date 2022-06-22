/**
 * Inspired by existing Vulcan Next graphql API route
 */
// import cors from "cors";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
// import { mergeSchemas } from "@graphql-tools/schema";
import { multiQuery, MultiVariables } from "@vulcanjs/graphql";

// import mongoConnection from "~/api/middlewares/mongoConnection";
// import corsOptions from "~/api/cors";
// import { contextFromReq } from "~/api/context";

import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
import { buildDefaultQueryResolvers } from "@vulcanjs/graphql/server";
import { createGraphqlModelServer } from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { GraphqlObjectId } from "../../../packages/mongo-apollo";
import { makeApolloServer } from "./utils/server";

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
      optional: true,
      canRead: ["anyone"],
      canCreate: ["anyone"],
      canUpdate: ["anyone"],
      //canDelete: ["guests"],
    },
    userId: {
      type: String,
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
// Work in progress
test("filter by id, using Mongo ObjectId", async () => {
  const server = await makeApolloServer(models);
  const contributor = await contributorMongooseModel.create({ name: "John" });
  expect(contributor._id).toBeInstanceOf(ObjectId);
  const res = await server.executeOperation({
    query: multiQuery({ model: Contributor }),
    variables: {
      input: {
        filter: {
          _id: {
            _in: [contributor._id],
          },
        },
      },
    } as MultiVariables,
  });
  expect(res.data).toMatchObject({
    contributors: { results: [{ name: "John" }] },
  });
});
