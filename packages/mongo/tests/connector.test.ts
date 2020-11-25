import { createMongooseConnector } from "../connector";
import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
// @see https://mongoosejs.com/docs/jest.html
import mongoose from "mongoose";

describe("vulcan/mongo/connector", () => {
  let mongod;
  beforeAll(async () => {
    // Spin up a dummy mongo server
    mongod = new MongoMemoryServer();

    const uri = await mongod.getUri();
    // const port = await mongod.getPort();
    // const dbPath = await mongod.getDbPath();
    // const dbName = await mongod.getDbName();
    // Connect mongoose client
    await mongoose.connect(uri);
  });
  test("create a connector from a model", () => {});
  describe("CRUD", () => {
    test("find", () => {});
    test("findOne", () => {});
    test("findOneById", () => {});
    test("filter", () => {});
    test("create", () => {});
    test("update", () => {});
    test("delete", () => {});
  });
  afterAll(async () => {
    // remove the collection
    // disconnect the client
    await mongoose.disconnect();
    // stop mongo server
    await mongod.stop();
  });
});
