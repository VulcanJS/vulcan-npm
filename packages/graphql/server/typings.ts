import { CreateVariables, UpdateVariables } from "../typings";

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
