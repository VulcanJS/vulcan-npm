import { VulcanGraphqlModelServer } from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import type { Connector } from "@vulcanjs/crud/server";
import { MongoDataSource } from "apollo-datasource-mongodb";
import type { Model } from "mongoose";
/**
 * Create a mongoose data source
 * @param model
 * @param connector
 * @returns
 */
const createMongooseDataSource = (
  model: VulcanGraphqlModelServer,
  connector: Connector
) => {
  const rawCollection = connector.getRawCollection();
  if (!rawCollection) {
    console.warn(`Model ${model.name} has no rawCollection in its connector. If it is not a Mongoose model, please
    manually provide a dataSource in model.graphql options.`);
    return undefined;
  }
  // TODO: check that it's a mongoose model?
  const mongooseModel = rawCollection as unknown as Model<any>;
  return new MongoDataSource(mongooseModel);
};

/**
 * Add default Mongo connector and dataSource to models
 *
 * For a custom behaviour, you can set the connector and createDataSource manually when creating your model
 * @param models
 * @returns
 */
export const addDefaultMongoConnector = (
  models: Array<VulcanGraphqlModelServer>
) => {
  models.forEach((model) => {
    if (!model.graphql.connector) {
      model.graphql.connector = createMongooseConnector(model);
    }
    if (!model.graphql.createDataSource) {
      model.graphql.createDataSource = () =>
        createMongooseDataSource(model, model.graphql.connector!);
    }
  });
  return models;
};
