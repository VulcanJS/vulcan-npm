import type { VulcanCrudModelServer } from "@vulcanjs/crud/server";
import { CreateVariables, UpdateVariables } from "@vulcanjs/crud";
import { VulcanGenericDataSource } from "./contextBuilder";
import { VulcanFieldSchemaServer, VulcanSchema } from "@vulcanjs/schema";
import { GraphqlModel, VulcanGraphqlFieldSchema } from "../typings";

export interface ResolveAsDefinition {
  /**
   *
   * Resolved field name
   *
   * @example if field is "userId", resolved fieldName should be "user"
   *
   * TODO: it as not mandatory in earlier versions of Vulcan?
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

// Server only model fields
export interface GraphqlModelServer extends GraphqlModel {
  queryResolvers?: QueryResolverDefinitions;
  mutationResolvers?: MutationResolverDefinitions;
  /**
   * An Apollo dataSource
   *
   * Must at least implement default Vulcan methods
   * (inspired by the Mongo data source) to make
   * field resolvers and relation resolvers performant
   *
   * @see https://www.apollographql.com/docs/apollo-server/data/data-sources/
   */
  createDataSource?: () => VulcanGenericDataSource | any;
}

// @server-only
export interface VulcanGraphqlModelServer //VulcanModel<VulcanGraphqlSchemaServer>,
  extends VulcanCrudModelServer<VulcanGraphqlSchemaServer> {
  graphql: GraphqlModelServer;
}

/**
 * @see https://graphql.org/learn/execution/#root-fields-resolvers
 */
export type QueryResolver = (
  /**
   * The full document for your field resolver (unused for full document resolver)
   */
  root: any,
  /** The variables of your resolverThe arguments provided to the field in the GraphQL query.
   * @example foo(var: string) FooResult
   * will give
   * (document, {var}) => { <your resolver code> }
   */
  args: any,
  /**
   * GraphQL context.
   * In Vulcan the usual structure is:
   * {
   *  ModelName: { model, connector} # model and connector for each model, based on their name
   *  currentUser, userId, # the user info
   *  req # the http request
   * }
   */
  context: any,
  /**
   * A value which holds field-specific information relevant to the current query as well
   * as the schema details, also refer to type GraphQLResolveInfo for more details.
   */
  info?: any
) => Promise<any>;
export type MutationResolver<TVariables = any, TResult = any> = (
  root: any,
  variables: TVariables,
  context: any
) => Promise<TResult>;
export type Resolver = QueryResolver | MutationResolver;
export type QueryResolverMap = {
  [resolverName in string]: QueryResolver;
};
export type MutationResolverMap = {
  [resolverName in string]: QueryResolver;
};
export interface ResolverMap {
  [resolverName: string]: QueryResolver | MutationResolver;
}

export interface ModelResolverMap {
  Query?: QueryResolverMap;
  Mutation?: MutationResolverMap;
  // need to make ts happy, as Apollo is using an indexed type for resolvers
  [other: string]: any;
}
export interface AnyResolverMap {
  [typeName: string]: Resolver | any;
}
// Vulcan representation of resolvers for further schema generation
export interface TopLevelResolverMap extends ModelResolverMap {
  [typeName: string]: any;
}

export interface QueryTypeDefinition {
  description?: string;
  query: string;
}
export interface MutationTypeDefinition {
  description?: string;
  mutation: string;
}

//
interface QueryResolverDefinition {
  description?: string;
  resolver: QueryResolver;
}

export interface QueryResolverDefinitions {
  single?: QueryResolverDefinition;
  multi?: QueryResolverDefinition;
}

// TODO
interface MutationResolverDefinition<TArgs = any, TResult = any> {
  description?: string;
  name?: string;
  mutation: MutationResolver<TArgs, TResult>;
}
export interface MutationResolverDefinitions {
  create?: MutationResolverDefinition<CreateVariables>;
  update?: MutationResolverDefinition<UpdateVariables>;
  upsert?: MutationResolverDefinition;
  delete?: MutationResolverDefinition;
}
// @server-only
export type VulcanGraphqlSchemaServer =
  VulcanSchema<VulcanGraphqlFieldSchemaServer>;

// @server-only
export interface VulcanGraphqlFieldSchemaServer
  extends VulcanGraphqlFieldSchema,
    VulcanFieldSchemaServer {
  // this is a custom function => it has to be defined only on the server
  resolveAs?: Array<ResolveAsDefinition> | ResolveAsDefinition;
}
