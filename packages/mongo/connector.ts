import { Connector } from "@vulcanjs/graphql";
import { VulcanModel } from "@vulcanjs/model";
// Compute a Mongo selector
import { filterFunction } from "./mongoParams";

import mongoose, { QueryFindOptions, FilterQuery } from "mongoose";

export type MongooseConnector<TModel = any> = Connector<
  TModel,
  FilterQuery<TModel>,
  QueryFindOptions
>;

export const createMongooseConnector = <TModel = any>(
  model: VulcanModel
): MongooseConnector<TModel> => {
  // 1. retrieve or create the mongoose model
  // TODO: get a better key than "model.name" eg "model.mongo.collectionName"
  let MongooseModel = mongoose.models?.[model.name];
  if (!MongooseModel) {
    // TODO: compute a Mongoose schema from a VulcanSchema automatically
    // TODO: remove the strict: false option! It bypassed Mongoose schema system until we are able to autocompute the Mongoose schema
    const schema = new mongoose.Schema({}, { strict: false });
    // TODO: get name from a custom "model.mongo" option, using the model extension system like for graphql
    MongooseModel = mongoose.model(model.name, schema);
  }
  // 2. create the connector
  return {
    find: async (selector, options) => {
      const documents = await MongooseModel.find(
        selector || {},
        null,
        options
      ).exec();
      return documents.map((d) => d.toJSON());
    },
    findOne: async (selector) => {
      const document = await MongooseModel.findOne(selector).exec();
      return document && document.toJSON();
    },
    findOneById: async (id) => {
      const document = await MongooseModel.findById(id).exec();
      return document && document.toJSON();
      //throw new Error("findOneById not yet implemented in Mongoose connector");
    },
    count: async (selector) => {
      const count = await MongooseModel.countDocuments(selector || {});
      return count;
    },
    create: async (document) => {
      const mongooseDocument = new MongooseModel(document);
      const createdDocument = await mongooseDocument.save();
      return createdDocument && createdDocument.toJSON();
    },
    update: async (selector, modifier, options) => {
      if (options) {
        console.warn(
          "update do not implement options yet",
          "selector:",
          selector,
          "options:",
          options
        );
      }
      /*const updateResult = */ await MongooseModel.update(selector, modifier);
      // NOTE: update result is NOT the updated document but the number of updated docs
      // we need to fetch it again
      const updatedDocument = await MongooseModel.findOne(selector).exec();
      return updatedDocument && updatedDocument.toJSON();
    },
    delete: async (selector) => {
      const deletedRawDocument = await MongooseModel.findOne(selector).exec();
      const deletedDocument = deletedRawDocument && deletedRawDocument.toJSON();
      await MongooseModel.remove(selector); // collection.remove is deprecated
      return deletedDocument;
    },
    // This function is meant at generating options for Find and select
    _filter: async (input, context) => {
      return await filterFunction(model, input, context);
      //return { selector: {}, filteredFields: [], options: {} };
    },
  };
};
