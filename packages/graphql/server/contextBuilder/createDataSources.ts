/**
 * Generate default data sources for models.
 *
 * As a default, will generate Mongoose data sources
 */
import { VulcanGraphqlModelServer } from "..";
import type { VulcanGenericDataSource } from "./typings";

interface ModelDataSources {
  [typeName: string]: VulcanGenericDataSource;
}
/**
 * Build a default graphql context for a list of models
 *
 * NOTE: when coding custom mutation or resolvers, you DON'T need to rely on this context
 * It is used internally by Vulcan to generate the default query and mutation resolvers,
 * and field/relation resolvers for the dataSources
 * @param models
 */
export const createDataSources =
  (models: Array<VulcanGraphqlModelServer>) => (): ModelDataSources => {
    const dataSources = models.reduce((dataSources, model) => {
      // TODO: we should find a way to guarantee that all models have a default connector
      /* const connector =
        model.crud.connector || createMongooseConnector(model);*/
      if (!model.graphql.createDataSource)
        throw new Error(
          "GraphQL models must have a createDataSource function."
        );
      return {
        ...dataSources,
        [model.name]: model.graphql.createDataSource() /*||
          createMongooseDataSource(model, connector),*/,
      };
    }, {});
    return dataSources;
  };
