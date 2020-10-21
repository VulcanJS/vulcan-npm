import { VulcanModel } from "@vulcanjs/model";

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
  ) => { selector: any; options: any };
  /**
   * Find data in the database
   */
  find: <TModel>(
    model: VulcanModel,
    selector: Object,
    options: Object
  ) => Promise<Array<TModel>>;
  count: (model: VulcanModel, selector: Object) => Promise<number>;
}
