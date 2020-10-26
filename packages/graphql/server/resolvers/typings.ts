import { VulcanModel } from "@vulcanjs/model";
import { VulcanDocument } from "@vulcanjs/schema";
import { AnyARecord } from "dns";
/**
 * TODO
// NOTE: the connector is shared between all models (so you must pass the model as a parameter)
// We might want to have instead one connector per model?
// So the model could be removed from all methods parameters

To be investigated after testing out the connector pattern
 */

/**
 * A database abstraction compatible with Vulcan
 */
export interface Connector<TModel = any> {
  /**
   * Compute the relevant selectors
   */
  filter: (
    model: VulcanModel,
    input: any,
    context: any
  ) => {
    // mongo like selector
    selector: any;
    //
    options: any;
    filteredFields: any;
  };
  // replaces collection.loader.load
  // @see https://github.com/GraphQLGuide/apollo-datasource-mongodb/#findonebyid
  findOneById: (model: VulcanModel, _id: string) => Promise<TModel>;
  // replaces get
  findOne: (
    model: VulcanModel,
    selector: Object,
    options?: Object
  ) => Promise<TModel>;
  /**
   * Find data in the database
   */
  find: (
    model: VulcanModel,
    selector: Object,
    options: Object
  ) => Promise<Array<TModel>>;
  count: (model: VulcanModel, selector: Object) => Promise<number>;
  // TODO: should we keep supporting loader.load and get? or
  // Mutations
  create: (model: VulcanModel, data: VulcanDocument) => Promise<string>;
  update: (
    model: VulcanModel,
    selector: Object,
    modifier: Object,
    { removeEmptyStrings: boolean }
  ) => Promise<TModel>;
  delete: (model: VulcanModel, selector: Object) => Promise<any>;
}

export interface ContextWithUser {
  currentUser?: any;
  [key: string]: any;
}
