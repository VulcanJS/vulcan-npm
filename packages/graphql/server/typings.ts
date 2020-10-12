export type Resolver = Function;
export type ResolverMap = {
  [resolverName in string]: Resolver;
};

// Vulcan representation of resolvers for further schema generation
export type ModelResolverMap = { [typeName in string]: ResolverMap };
export type ResolversDefinitions = Array<ModelResolverMap>;
