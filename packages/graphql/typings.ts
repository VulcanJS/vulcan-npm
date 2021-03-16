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
import { ContextWithUser } from "./server/resolvers";

// SCHEMA TYPINGS
// Custom resolver
export interface ResolveAsDefinition {
  fieldName?: string;
  typeName?: string;
  type?: string;
  description: string;
  arguments: any;
  resolver?: QueryResolver;
  addOriginalField?: boolean;
}
export interface RelationDefinition {
  fieldName: string;
  typeName: string;
  kind: "hasOne" | "hasMany";
}

interface VulcanGraphqlFieldSchema extends VulcanFieldSchema {
  // GRAPHQL
  resolveAs?: Array<ResolveAsDefinition> | ResolveAsDefinition;
  relation?: RelationDefinition; // define a relation to another model
  typeName?: string; // the GraphQL type to resolve the field with
}
// Base schema + GraphQL Fields
export type VulcanGraphqlSchema = VulcanSchema<VulcanGraphqlFieldSchema>;

// MODEL TYPINGS
// Those typings extends the raw model/schema system
export interface VulcanGraphqlModelSkeleton extends VulcanModel {
  graphql: Pick<GraphqlModel, "typeName">;
}
// information relevant for server and client
interface GraphqlSharedModel {
  typeName: string;
  multiTypeName: string; // plural name for the multi resolver
  multiResolverName: string;
  singleResolverName: string;
  defaultFragment?: string;
  defaultFragmentName?: string;
}
// Client only model fields
interface GraphqlClientModel {}
// Server only model fields
interface GraphqlServerModel {
  queryResolvers?: QueryResolverDefinitions;
  mutationResolvers?: MutationResolverDefinitions;
  callbacks?: MutationCallbackDefinitions;
}
// With client and server fields (at this point, we can't actually differentiate them)
export type GraphqlModel = GraphqlSharedModel &
  GraphqlServerModel &
  GraphqlClientModel;

// TODO: not used yet. A schema for graphql might contain those additional fields.
// export interface VulcanFieldSchemaGraphql extends VulcanFieldSchema {
//   relation;
//   resolveAs;
// }
// Extended model with extended schema
export interface VulcanGraphqlModel extends VulcanModel<VulcanGraphqlSchema> {
  graphql: GraphqlModel;
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
// type CreateCallback = (document: VulcanDocument) => VulcanDocument | Promise<VulcanDocument>
export interface MutationCallbackDefinitions {
  create?: {
    validate?: Array<Function>;
    before?: Array<CreateBeforeCb>;
    after?: Array<CreateAfterCb>;
    async?: Array<Function>;
  };
  update?: {
    validate?: Array<Function>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
  delete?: {
    validate?: Array<Function>;
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
export interface CreateInput<TModel = any> {
  data: TModel;
}
export interface CreateVariables<TModel = any> {
  input: CreateInput<TModel>;
}
export interface UpdateInput<TModel> {
  data: TModel;
  id?: string;
}
export interface UpdateVariables<TModel = any> {
  input: UpdateInput<TModel>;
}

// Filtering
type MongoLikeSortOption = "asc" | "desc";
type MongoLikeCondition =
  | "_eq"
  | "_gt"
  | "_gte"
  | "_in"
  | "_lt"
  | "_lte"
  | "_neq"
  | "_nin"
  | "_is_null"
  | "_is"
  | "_contains"
  | "_like";

type MongoLikeOperator = "_and" | "_or" | "_not";

type MongoLikeSelector = {
  [key in MongoLikeCondition]?: any;
} &
  {
    [key in MongoLikeOperator]?: Array<any>;
  };
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
// Minimum API for filter function
export interface FilterableInput<TModel = any> {
  id?: string;
  filter?: MongoLikeSelector &
    { [fieldName in keyof TModel]?: MongoLikeSelector };
  sort?: { [fieldName in keyof TModel]?: MongoLikeSortOption };
  limit?: number;
  search?: string;
  offset?: number;
}
