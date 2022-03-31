import { VulcanGraphqlModelServer } from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { createMongooseDataSource } from "./createMongooseDataSource";

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
