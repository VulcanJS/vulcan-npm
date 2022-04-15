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
}

// Extended model with extended schema
// @server-only
export interface VulcanCrudModelServer<TSchema = any>
  extends VulcanModel<TSchema> /* VulcanCrudSchemaServer */ {
  crud: CrudModelServer;
}
