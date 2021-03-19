import { VulcanDocument } from "@vulcanjs/schema";
import { FilterableInput } from "../../typings";

/**
 * A database abstraction compatible with Vulcan
 */
export interface Connector<
  TModel extends VulcanDocument = any,
  TSelector = any,
  TOptions = any
> {
  /**
   * Compute the relevant selectors
   */
  _filter: (
    input: FilterableInput<TModel>,
    context: any
  ) => Promise<{
    selector: TSelector; // VulcanSelector is the input, TSelector the output
    options: TOptions;
    filteredFields: Array<any>; // TODO: in defaultQueryResolvers we do filteredFields = Object.keys(selector), so what is this parameter?
  }>;
  // replaces collection.loader.load
  // @see https://github.com/GraphQLGuide/apollo-datasource-mongodb/#findonebyid
  findOneById: (_id: string) => Promise<TModel>;
  // replaces get
  findOne: (selector?: TSelector, options?: TOptions) => Promise<TModel>;
  /**
   * Find data in the database
   */
  find: (selector?: TSelector, options?: Object) => Promise<Array<TModel>>;
  count: (selector?: TSelector) => Promise<number>;
  // TODO: should we keep supporting loader.load and get? or
  // Mutations
  create: (data: Partial<TModel>) => Promise<TModel>;
  update: (
    selector: TSelector,
    modifier: Object,
    options?: { removeEmptyStrings: boolean }
  ) => Promise<TModel>;
  // Returns the delete object
  delete: (selector: TSelector) => Promise<TModel>;
}
