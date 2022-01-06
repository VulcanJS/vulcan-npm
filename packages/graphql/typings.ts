import { VulcanModel } from "@vulcanjs/model";
import { OperationVariables } from "@apollo/client";
import {
  MutationResolverDefinitions,
  QueryResolverDefinitions,
  QueryResolver,
} from "./server/typings";
import {
  VulcanDocument,
  VulcanFieldSchema,
  VulcanSchema,
} from "@vulcanjs/schema";
import { Connector, ContextWithUser } from "./server/resolvers";
import { FilterableInput } from "@vulcanjs/crud";

// SCHEMA TYPINGS
// Custom resolver

/**
 * @example       field: {
        type: String,
        optional: true,
        canRead: ["admins"],
        resolveAs: {
          fieldName: "resolvedField",
          type: "Bar",
          resolver: async (root, args, context) => {
            return `Variable value is ${args?.variable}`;
          },
          arguments: "variable: String",
          description: "Some field",
          typeName: "String",
          addOriginalField: true,
        },
      }
 */
export interface ResolveAsDefinition {
  /**
   *
   * Resolved field name
   *
   * @example if field is "userId", resolved fieldName should be "user"
   **/
  fieldName: string;
  /**
   * Return type of the resolver
   *
   * NOTE: it's an alias for "type"
   */
  typeName?: string;
  /**
   * Alias for typeName
   *
   * @deprecated
   */
  type?: string;
  /** Graphql description (helper text in your graphql schema) */
  description?: string;
  /**
   * Graphql arguments of the resolver, as comma separated string,
   * if it takes some params
   * TODO: not sure if this, or an array of "name, type"?
   * @example arguments: "foobar: string,hello: string"
   * resolver: async (document, {foobar, hello}, context, info) => {...}
   */
  arguments?: string;
  /**
   * The resolver function
   *
   * NOTE: your function will be wrapped with a permission checker,
   * based on the field "canRead" permissions
   *
   *
   */
  resolver?: QueryResolver;
  /**
   * Whether keeping the field or not
   * @example if field is "userId" and resolved field is "user", set to true to keep "userId" in the document
   */
  addOriginalField?: boolean;
}
interface RelationDefinitionBase {
  fieldName: string;
  kind: "hasOne" | "hasMany";
}
export type RelationDefinition =
  | (RelationDefinitionBase & {
      /**
       * @deprecated Use model instaed
       * Model can be recovered from the typeName in resolvers*/
      typeName: string;
    })
  | (RelationDefinitionBase & {
      /** Pass the model directly instead of just the graphql typename */
      model: VulcanGraphqlModel;
    });

export interface VulcanGraphqlFieldSchema extends VulcanFieldSchema {
  relation?: RelationDefinition; // define a relation to another model
  typeName?: string; // the GraphQL type to resolve the field with

  // TODO: not sure about the arguments in function mode
  query?: string | (() => string); // field-specific data loading query
  autocompleteQuery?: string | (() => string); // query used to populate autocomplete
}
// @server-only
export interface VulcanGraphqlFieldSchemaServer
  extends VulcanGraphqlFieldSchema {
  // this is a custom function => it has to be defined only on the server
  resolveAs?: Array<ResolveAsDefinition> | ResolveAsDefinition;
}
// Base schema + GraphQL Fields
export type VulcanGraphqlSchema = VulcanSchema<VulcanGraphqlFieldSchema>;
// @server-only
export type VulcanGraphqlSchemaServer =
  VulcanSchema<VulcanGraphqlFieldSchemaServer>;

// MODEL TYPINGS
// Those typings extends the raw model/schema system
export interface VulcanGraphqlModelSkeleton extends VulcanModel {
  graphql: Pick<GraphqlModel, "typeName">;
}
// information relevant for server and client
interface GraphqlModel {
  typeName: string;
  multiTypeName: string; // plural name for the multi resolver
  multiResolverName: string;
  singleResolverName: string;
  defaultFragment?: string;
  defaultFragmentName?: string;
}
// Client only model fields
// interface GraphqlClientModel extends GraphqlModel {}

// Server only model fields
export interface GraphqlModelServer extends GraphqlModel {
  queryResolvers?: QueryResolverDefinitions;
  mutationResolvers?: MutationResolverDefinitions;
  callbacks?: MutationCallbackDefinitions;
  /**
   * Connector tied to a model
   *
   * NOTE: since the connector itself depends on the model, you need
   * to define this value AFTER creating the model
   *
   * @example
   * const connector = ...
   * const model = ...
   * model.graphql.connector = connector
   */
  connector?: Connector;
}

// TODO: not used yet. A schema for graphql might contain those additional fields.
// export interface VulcanFieldSchemaGraphql extends VulcanFieldSchema {
//   relation;
//   resolveAs;
// }
// Extended model with extended schema
export interface VulcanGraphqlModel extends VulcanModel<VulcanGraphqlSchema> {
  graphql: GraphqlModel;
}
// @server-only
export interface VulcanGraphqlModelServer
  extends VulcanModel<VulcanGraphqlSchemaServer> {
  graphql: GraphqlModelServer;
}

// Mutations
export type DefaultMutatorName = "create" | "update" | "delete";

// Callbacks typings
type MaybeAsync<T> = T | Promise<T>;
interface CreateProperties {
  data: any;
  originalData: VulcanDocument;
  currentUser: any;
  model: VulcanGraphqlModel;
  context: ContextWithUser;
  schema: VulcanSchema;
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

// Wrap input type, so the input is in the "input" field as an object
export interface ApolloVariables<TInput> {
  input: TInput;
}

// Mutation/Hooks typings
interface CommonInput {
  contextName?: string;
}
export interface CreateInput<TModel = any> extends CommonInput {
  data: TModel;
}
export interface CreateVariables<TModel = any> {
  input: CreateInput<TModel>;
}
export interface UpdateInput<TModel> extends CommonInput, FilterableInput {
  data: TModel;
  id?: string;
}
export interface UpdateVariables<TModel = any> {
  input: UpdateInput<TModel>;
}

export interface DeleteInput extends CommonInput, FilterableInput {
  id?: string;
}
export interface DeleteVariables {
  input: DeleteInput;
}

// Inputs
export interface SingleInput<TModel = any> extends QueryInput<TModel> {
  id?: string;
  allowNull?: boolean; // if false, throw an error when not found
  filterArguments?: Object;
}
export interface SingleVariables<TModel = any> extends OperationVariables {
  _id?: string;
  input?: SingleInput;
}
export interface MultiInput<TModel = any> extends QueryInput<TModel> {
  enableTotal?: boolean;
}
export interface MultiVariables<TModel = any> extends OperationVariables {
  input: MultiInput<TModel>;
}
// Generic query inputs
export interface QueryInput<TModel = any> extends FilterableInput<TModel> {
  enableCache?: boolean; // cache the query, server-side
}
