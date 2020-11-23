import { RelationDefinition, VulcanFieldSchema } from "@vulcanjs/schema";
import { CreateVariables, UpdateVariables } from "../typings";
export type QueryResolver = (
  root: any,
  args: any,
  context: any,
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
