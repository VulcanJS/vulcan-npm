export type QueryResolver = Function;
export type MutationResolver = Function;
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
  Query: QueryResolverMap;
  Mutation: MutationResolverMap;
}
export interface AnyResolverMap {
  [typeName: string]: Resolver | any;
}
// Vulcan representation of resolvers for further schema generation
export interface TopLevelResolverMap extends ModelResolverMap {
  [typeName: string]: any;
}

export interface QuerySchema {
  description?: string;
  query: string;
}
export interface MutationSchema {
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
export interface MutationResolverDefinitions {}
