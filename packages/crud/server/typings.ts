import type { VulcanModel } from "@vulcanjs/model";
import type { Connector } from "./connector";
import type { VulcanDocument, VulcanSchema } from "@vulcanjs/schema";

// Callbacks typings
type MaybeAsync<T> = T | Promise<T>;
interface CreateProperties {
  data: any;
  originalData: VulcanDocument;
  currentUser: any;
  model: VulcanModel;
  schema: VulcanSchema;
  /** @deprecated Get currentUser directly */
  context: any; //ContextWithUser;
}
type CreateBeforeCb = (
  data: VulcanDocument,
  properties: CreateProperties
) => MaybeAsync<VulcanDocument>;
type CreateAfterCb = (
  data: VulcanDocument,
  properties: CreateProperties
) => MaybeAsync<VulcanDocument>;
type CreateAsyncCb = (
  data: any, // TODO: not sure what happens when no iterator is provided in runCallbacks
  properties: CreateProperties
) => MaybeAsync<void>;
type ValidationError = any;

type ValidateCb = (
  validationErrors: Array<ValidationError>,
  properties: any
) => MaybeAsync<Array<ValidationError>>;

// type CreateCallback = (document: VulcanDocument) => VulcanDocument | Promise<VulcanDocument>
export interface MutationCallbackDefinitions {
  create?: {
    /**
     * @example packages/graphql/server/resolvers/mutators.ts
     */
    validate?: Array<ValidateCb>;
    before?: Array<CreateBeforeCb>;
    after?: Array<CreateAfterCb>;
    async?: Array<Function>;
  };
  update?: {
    validate?: Array<ValidateCb>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
  delete?: {
    validate?: Array<ValidateCb>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
}

// SCHEMA TYPINGS
// Custom resolver

// MODEL TYPINGS
// Those typings extends the raw model/schema system
// information relevant for server and client
interface CrudModel {}
// Client only model fields
// interface GraphqlClientModel extends GraphqlModel {}

// Server only model fields
interface CrudModelServer extends CrudModel {
  /**
   * Connector tied to a model
   *
   * NOTE: since the connector itself depends on the model, you need
   * to define this value AFTER creating the model
   *
   * @example
   * const connector = ...
   * const model = ...
   * model.crud.connector = connector
   */
  connector?: Connector;
  callbacks?: MutationCallbackDefinitions;
  /**
   * See "Filtering" documentation
   * 
   * @experimental Only supports Mongo at the moment
   * The return type should match your Connector type
   * so a Mongo selector/mongo options for example
   * 
   * @example {
      name: '_withRating',
      arguments: 'average: Int',
      filter: ({ input, context, filterArguments }) => {
        const { average } = filterArguments;
        const { Reviews } = context;
        // get all movies that have an average review score of X stars 
        const xStarReviewsMoviesIds = getMoviesByScore(average);
        return {
          selector: { _id: {$in: xStarReviewsMoviesIds } },
          options: {}
        }
      };
    }
   */
  customFilters?: Array<{
    /**
     * Preferably start with a underscore
     * Must not be a name already used (avoid _in, _eq etc.)
     * @example _withRatings
     */
    name: string;
    /**
     * GraphqQL arugments
     * @example "average: Int"
     */
    arguments?: string;
    filter: (args: { input: any; context: any; filterArguments: any }) => any;
  }>;
}

// Extended model with extended schema
// @server-only
export interface VulcanCrudModelServer<TSchema = any>
  extends VulcanModel<TSchema> /* VulcanCrudSchemaServer */ {
  crud: CrudModelServer;
}
