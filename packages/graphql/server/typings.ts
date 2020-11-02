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
interface MutationResolverDefinition {
  description?: string;
  name?: string;
  mutation: MutationResolver;
}
export interface MutationResolverDefinitions {
  create?: MutationResolverDefinition;
  update?: MutationResolverDefinition;
  upsert?: MutationResolverDefinition;
  delete?: MutationResolverDefinition;
}
