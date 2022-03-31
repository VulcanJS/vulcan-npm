import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server"; // @see https://github.com/nodkz/mongodb-memory-server
/**
 * Set up a dummy, in-memory Mongo database,
 * just for testing.
 */

// Init an in-memory Mongo server
// TODO: use a real db like in Vulcan Next
let mongod;
let mongoUri;
export const startMongo = async () => {
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
export const closeMongo = async () => {
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
