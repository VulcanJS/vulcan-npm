import mongoose from "mongoose";
import { Contributor } from "./models";

export const seedDemoDb = async () => {
  // insert some dummy data just for testing
  console.log("Seeding...");
  /**
   * NOTE: calling the mongoose model directly WON'T run
   * the model callbacks.
   *
   * You may instead want to use a "mutator"
   */
  const contributorMongooseModel = mongoose.models[Contributor.name];
  await contributorMongooseModel.remove({});
  await contributorMongooseModel.create({ name: "John Doe" });
  console.log("Done seeding db with 1 contributor");
};
