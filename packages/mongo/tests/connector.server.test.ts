// NOTE: this set of test applies to almost any kind of connector,
// the only moving part is the way we setup the dummy test database
import { createMongooseConnector } from "../connector";
import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
// @see https://mongoosejs.com/docs/jest.html
import mongoose from "mongoose";
import { createModel } from "@vulcanjs/model";
import { Connector } from "@vulcanjs/graphql/server";

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
  const Foo = createModel({
    name: "Foo",
    schema: {
      text: {
        type: String,
        optional: true,
      },
      number: {
        type: Number,
        optional: true,
      },
    },
  });
  const collectionName = "foos"; // autocomputed on model creation
  test("create a connector from a model and create corresponing mongoose model", async () => {
    expect(mongoose.models[Foo.name]).toBeUndefined();
    const connector = createMongooseConnector(Foo);
    expect(mongoose.models[Foo.name]).toBeTruthy();
    expect(mongoose.connection.collections[collectionName]).toBeTruthy();
    expect(connector).toBeDefined();
    // drop the collection
    // NOTE: this call may fail if the collection is not there yet
    // await mongoose.connection.collections[collectionName].drop();
  });
  describe("CRUD", () => {
    let connector: Connector;
    beforeAll(() => {
      connector = createMongooseConnector(Foo);
      expect(mongoose.models[Foo.name]).toBeTruthy();
      expect(connector).toBeDefined();
    });
    beforeEach(async () => {
      await mongoose.models[Foo.name].remove({});
    });
    afterAll(async () => {
      // drop the collection
      await mongoose.connection.collections[collectionName].drop();
    });
    test("create", async () => {
      const docToCreate = { text: "hello" };
      const createdDoc = await connector.create(docToCreate);
      expect(createdDoc).toBeDefined();
      expect(createdDoc).toMatchObject(docToCreate);
      expect(createdDoc._id).toBeDefined();
    });
    test("findOneById", async () => {
      const docToCreate = { text: "hello" };
      const createdDoc = await connector.create(docToCreate);
      const foundDoc = await connector.findOneById(createdDoc._id);
      expect(foundDoc).toBeDefined();
      expect(foundDoc).not.toBeNull();
      expect(foundDoc).toEqual(createdDoc);
    });
    test("findOneById return null if doc is not found", async () => {
      const foundDoc = await connector.findOneById("41224d776a326fb40f000001");
      expect(foundDoc).toBeDefined();
      expect(foundDoc).toBeNull();
    });
    test("count - is 0 initially", async () => {
      const initialCount = await connector.count();
      expect(initialCount).toEqual(0);
    });
    test("count", async () => {
      const docsToCreate = [{ text: "hello" }, { text: "world" }];
      const createdDocs = await Promise.all(docsToCreate.map(connector.create));
      const count = await connector.count();
      expect(count).toEqual(2);
    });
    test("find - return empty array when db is empty", async () => {
      const foundDocs = await connector.find({}, {});
      expect(foundDocs).toEqual([]);
    });
    test("find", async () => {
      const docsToCreate = [{ text: "hello" }, { text: "world" }];
      const createdDocs = await Promise.all(docsToCreate.map(connector.create));
      const foundDocs = await connector.find({}, {});
      // order is not guaranteed
      expect(foundDocs.map((d) => d.text).sort()).toEqual(
        createdDocs.map((d) => d.text).sort()
      );
    });
    test("find - sorted", async () => {
      const docsToCreate = [{ number: 1 }, { number: 3 }, { number: 2 }];
      const createdDocs = await Promise.all(docsToCreate.map(connector.create));
      const foundDocs = await connector.find(
        {},
        {
          sort: {
            number: 1,
          },
        }
      );
      expect(foundDocs.map((d) => d.number)).toEqual([1, 2, 3]);
    });
    test("find - limit", async () => {
      const docsToCreate = [{ number: 1 }, { number: 3 }, { number: 2 }];
      const createdDocs = await Promise.all(docsToCreate.map(connector.create));
      const foundDocs = await connector.find(
        {},
        {
          sort: {
            number: -1,
          },
          limit: 2,
        }
      );
      expect(foundDocs.map((d) => d.number)).toEqual([3, 2]);
    });
    test("findOne", async () => {
      const docsToCreate = [{ text: "hello" }, { text: "world" }];
      const createdDocs = await Promise.all(docsToCreate.map(connector.create));
      const foundDoc = await connector.findOne({ _id: createdDocs[1]._id });
      expect(foundDoc).toEqual(createdDocs[1]);
    });
    test("filter", async () => {
      const result = await connector._filter({}, {});
      expect(result).toEqual({
        filteredFields: [],
        options: { limit: 1000, sort: { createdAt: -1 } },
        selector: {},
      });
    });
    test("update", async () => {
      const docToCreate = { text: "hello" };
      const createdDoc = await connector.create(docToCreate);
      const updatedDoc = await connector.update(
        { _id: createdDoc._id },
        { text: "updated" }
      );
      expect(updatedDoc).toMatchObject({
        _id: createdDoc._id,
        text: "updated",
      });
      const foundDoc = await connector.findOneById(createdDoc._id);
      expect(foundDoc).toMatchObject({ _id: createdDoc._id, text: "updated" });
    });
    test("delete", async () => {
      const docToCreate = { text: "hello" };
      const createdDoc = await connector.create(docToCreate);
      const deleted = await connector.delete(createdDoc);
      expect(deleted).toBe(true);
      const foundDoc = await connector.findOne({ _id: createdDoc._id });
      expect(foundDoc).toBeNull();
    });
  });
  afterAll(async () => {
    // remove the collection
    // disconnect the client
    await mongoose.disconnect();
    // stop mongo server
    await mongod.stop();
  });
});
