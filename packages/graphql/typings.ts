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
import { Merge } from "@vulcanjs/utils";
import { ContextWithUser } from "./server/resolvers";

// SCHEMA TYPINGS
// Custom resolver
export interface ResolveAsDefinition {
  /** Resolved field name
   *
   * @example if field is "userId", resolved fieldName should be "user"
   **/
  fieldName: string;
  typeName?: string;
  /** Graphql typeName */
  type: string;
  /** Graphql description */
  description?: string;
  /** Graphql arguments of the resolver, if it takes some params */
  arguments?: string;
  resolver?: QueryResolver;
  /**
   * Whether keeping the field or not
   * @example if field is "userId" and resolved field is "user", set to true to keep "userId" in the document
   */
  addOriginalField?: boolean;
}
export interface RelationDefinition {
  fieldName: string;
  typeName: string;
  kind: "hasOne" | "hasMany";
}

interface VulcanGraphqlFieldSchema extends VulcanFieldSchema {
  relation?: RelationDefinition; // define a relation to another model
  typeName?: string; // the GraphQL type to resolve the field with
}
// @server-only
interface VulcanGraphqlFieldSchemaServer extends VulcanGraphqlFieldSchema {
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

// Filtering and selectors
type VulcanSelectorSortOption = "asc" | "desc";

/**
 * { foo:2}
 * { foo: { _gt: 3}}
 */

type FieldSelector<TModel = any> = {
  [key in keyof TModel]?: ConditionSelector; // NOTE: we cannot yet pass native values | string | number | boolean | null | ;
} &
  { [key in PossibleOperators]?: never };

type ConditionSelector = {
  //[key in VulcanSelectorCondition]?: VulcanSelector<TModel>;
  _eq?: any;
  _gt?: string | number;
  _gte?: string | number;
  _in?: Array<any>;
  _lt?: string | number;
  _lte?: string | number;
  _neq?: any;
  _nin?: Array<any>;
  _is_null?: any;
  _is?: any;
  _contains?: any;
  _like?: string;
};
type PossibleConditions = keyof ConditionSelector;

type PossibleOperators = "_and" | "_or" | "_not";
type OperatorSelector<TModel = any> = {
  [key in PossibleOperators]?: Array<FieldSelector<TModel>>; // Array<VulcanSelector<TModel>>; //VulcanInnerSelector<TModel>>;
};

// Field selector = { foo: 2} where foo is part of the model
//type VulcanFieldSelector<TModel = any> = {
//  [
//    fieldName: string /*in Exclude<
//    keyof TModel,
//    VulcanPossibleConditions | VulcanPossibleOperators // field cannot be _gte, _and, etc.
//  >*/
//  ]: VulcanInnerSelector<TModel> | string | number | null | boolean; // can be a primirive value as well
//} & { [key in VulcanPossibleConditions]?: never } &
//  { [key in VulcanPossibleOperators]?: never };

// Inner selector = field selector, operators and also conditions
// type VulcanInnerSelector<TModel = any> = VulcanSelector<TModel> &
//   VulcanConditionSelector; // nested selector also allow conditions { foobar: { _gt: 2}}

/**
 * Combination of field selectors, conditions and operators
 * { _and: [{size:2}, {name: "hello"}], bar: 3}
 */

export type VulcanSelector<TModel = any> =
  | FieldSelector<TModel>
  | OperatorSelector<TModel>;

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
// Minimum API for filter function
export interface FilterableInput<TModel = any> {
  id?: string;
  filter?: VulcanSelector<TModel>;
  sort?: { [fieldName in keyof TModel]?: VulcanSelectorSortOption };
  limit?: number;
  search?: string;
  offset?: number;
}
