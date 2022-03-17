export interface ContextWithUser {
  currentUser?: any;
  [key: string]: any;
}

/**
 * Default Vulcan Apollo Context, extend as you wish
 */
export type VulcanApolloContext<TContext = any, TDataSources = any> = {
  currentUser?: any;
  /**
   * DataSources must at least implement a generic Vulcan data source
   * for each model, it's necessary for relation resolvers or field resolvers to work.
   * You can however add any other type of data source.
   */
  dataSources?: { [key: string]: VulcanGenericDataSource } & TDataSources;
  req?: any;
  res?: any;
} & TContext;

/**
 * A valid data source in Vulcan must include this API
 *
 * Based on Mongo data source API
 *
 * You can use SQL data sources as well as long as they implement this field
 *
 * @see https://www.apollographql.com/docs/apollo-server/data/data-sources/
 * @see https://github.com/GraphQLGuide/apollo-datasource-mongodb/
 * @see https://github.com/GraphQLGuide/apollo-datasource-mongodb/#api
 */
export interface VulcanGenericDataSource<TDocument = any> {
  findOneById: (id: string) => Promise<TDocument>;
  findByFields: (fields: {
    [fieldName: string]: any;
  }) => Promise<Array<TDocument>>;
}
