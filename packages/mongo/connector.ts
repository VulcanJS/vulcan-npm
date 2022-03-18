import { VulcanModel } from "@vulcanjs/model";
// Compute a Mongo selector
import { filterFunction } from "./mongoParams";

import mongoose, { QueryOptions, FilterQuery } from "mongoose";
import { Connector } from "@vulcanjs/crud/server";
import { debugVulcan } from "@vulcanjs/utils";
const debugMongoose = debugVulcan("mongoose");

export type MongooseConnector<TModel = any> = Connector<
  TModel,
  FilterQuery<TModel>,
  QueryOptions
>;

/**
 * Converts Mongo ObjectId to string
 *
 * Connectors are expected to use string ids
 * It was the default behaviour in Meteor for Mongo,
 * but Mongoose/raw Mongo default behaviour is to use ObjectId
 *
 * => we prefer string ids in Vulcan for a consistent representation, in particular
 * between the GraphQL client (that will always use string ids) and the server
 *
 * TODO: not sure why we need to turn the document into JSON though
 */
type MongoDoc<TModel> = {
  toJSON: () => TModel;
  _id: { toString: () => string };
};
function convertIdAndTransformToJSON<TModel>(doc: MongoDoc<TModel>): TModel;
function convertIdAndTransformToJSON<TModel>(
  docs: Array<MongoDoc<TModel>>
): Array<TModel>;
function convertIdAndTransformToJSON<TModel>(
  docOrDocs: MongoDoc<TModel> | Array<MongoDoc<TModel>>
): TModel | Array<TModel> {
  if (!Array.isArray(docOrDocs)) {
    const doc = docOrDocs;
    if (!doc)
      throw new Error(
        "Document is not defined during id transformation. You may have malformed documents in your database."
      );
    if (!doc._id) {
      throw new Error(
        `Document has no valid _id ${JSON.stringify(
          document
        )} during id transformation. You may use malformed document _id
          in your database (coming from Meteor?)`
      );
    }
    return { ...docOrDocs.toJSON(), _id: docOrDocs._id.toString() };
  } else {
    return docOrDocs.map((document) => {
      if (!document._id) {
        throw new Error(
          `Document has no valid _id ${JSON.stringify(
            document
          )} during id transformation. You may use malformed document _id
          in your database (coming from Meteor?)`
        );
      }
      return { ...document.toJSON(), _id: document._id.toString() };
    });
  }
}

export const createMongooseConnector = <TModel = any>(
  model: VulcanModel,
  options?: {
    /** Force a mongoose model. Use if you need to customize the schema or options */
    mongooseModel?: mongoose.Model<any>;
    mongooseSchema?: mongoose.Schema;
    /** Force a Mongoose instance (when using multiple databases,
     * also useful during local development when not using Yalc) */
    mongooseInstance?: mongoose.Mongoose;
  }
): MongooseConnector<TModel> => {
  const mongooseInstance = options?.mongooseInstance || mongoose;
  // 1. use, retrieve or create the mongoose model
  // TODO: get a better key than "model.name" eg "model.mongo.collectionName"
  let MongooseModel =
    options?.mongooseModel || mongooseInstance.models?.[model.name];
  if (!MongooseModel) {
    debugMongoose("Mongoose model", model.name, "not found, will create it.");
    // TODO: compute a Mongoose schema from a VulcanSchema automatically
    // TODO: remove the strict: false option! It bypassed Mongoose schema system until we are able to autocompute the Mongoose schema
    const schema =
      options?.mongooseSchema ||
      new mongooseInstance.Schema({}, { strict: false });
    // TODO: get name from a custom "model.mongo" option, using the model extension system like for graphql
    MongooseModel = mongooseInstance.model(model.name, schema);
  }
  // 2. create the connector
  return {
    find: async (selector, options) => {
      const found = await MongooseModel.find(
        selector || {},
        null,
        options
      ).exec();
      return convertIdAndTransformToJSON<TModel>(found);
    },
    findOne: async (selector) => {
      const found = await MongooseModel.findOne(selector).exec();
      const document = found && convertIdAndTransformToJSON<TModel>(found);
      return document;
    },
    findOneById: async (id) => {
      const found = await MongooseModel.findById(id).exec();
      const document = found && convertIdAndTransformToJSON<TModel>(found);
      return document;
      //throw new Error("findOneById not yet implemented in Mongoose connector");
    },
    count: async (selector) => {
      const count = await MongooseModel.countDocuments(selector || {});
      return count;
    },
    create: async (document) => {
      const mongooseDocument = new MongooseModel(document);
      const createdDocument = await mongooseDocument.save();
      return convertIdAndTransformToJSON(createdDocument);
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
      /*const updateResult = */ await MongooseModel.updateOne(
        selector,
        modifier
      );
      // NOTE: update result is NOT the updated document but the number of updated docs
      // we need to fetch it again
      const updatedDocument = await MongooseModel.findOne(selector).exec();
      return convertIdAndTransformToJSON(updatedDocument);
    },
    delete: async (selector) => {
      // NOTE: we don't return deleted document, as this is a deleteMany operation
      // const docFromDb = await MongooseModel.findOne(selector).exec();
      // const deletedRawDocument =
      //   docFromDb && convertIdAndTransformToJSON<TModel>(docFromDb);
      // const deletedDocument = deletedRawDocument;
      await MongooseModel.deleteMany(selector);
      return true; //deletedDocument;
    },
    // This function is meant at generating options for Find and select
    _filter: async (input, context) => {
      return await filterFunction(model, input, context);
      //return { selector: {}, filteredFields: [], options: {} };
    },
    getRawCollection: () => {
      return MongooseModel;
    },
  };
};
