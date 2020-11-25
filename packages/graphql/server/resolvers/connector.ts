import { VulcanDocument } from "@vulcanjs/schema";
// NOTE: vulcan/graphql CAN'T depend on vulcan/mongo or mongo so do not move this code in vulcan/mongo
// we use Mongo syntax but this is not a real dependency to Mongo, just a convenience, we only need the typings from Mongo
export type MongoSelector = Object;

/**
 * A database abstraction compatible with Vulcan
 */
export interface Connector<TModel extends VulcanDocument = any> {
  /**
   * Compute the relevant selectors
   */
  filter: (
    input: any,
    context: any
  ) => Promise<{
    selector: MongoSelector;
    options: any;
    filteredFields: Array<any>; // TODO: in defaultQueryResolvers we do filteredFields = Object.keys(selector), so what is this parameter?
  }>;
  // replaces collection.loader.load
  // @see https://github.com/GraphQLGuide/apollo-datasource-mongodb/#findonebyid
  findOneById: (_id: string) => Promise<TModel>;
  // replaces get
  findOne: (selector?: MongoSelector, options?: Object) => Promise<TModel>;
  /**
   * Find data in the database
   */
  find: (selector?: MongoSelector, options?: Object) => Promise<Array<TModel>>;
  count: (selector?: MongoSelector) => Promise<number>;
  // TODO: should we keep supporting loader.load and get? or
  // Mutations
  create: (data: Partial<TModel>) => Promise<TModel>;
  update: (
    selector: MongoSelector,
    modifier: Object,
    options?: { removeEmptyStrings: boolean }
  ) => Promise<TModel>;
  // Returns the delete object
  delete: (selector: Object) => Promise<TModel>;
}
