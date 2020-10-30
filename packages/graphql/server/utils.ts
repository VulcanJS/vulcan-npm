/**
 * Merge top level resolvers for each model into a big resolver
 * @param resolversList
 */
import deepmerge from "deepmerge";
import { TopLevelResolverMap } from "./typings";
export const mergeResolvers = (
  resolversList: Array<Partial<TopLevelResolverMap>>
): TopLevelResolverMap => {
  return resolversList.reduce(
    (mergedResolvers, currentResolver) =>
      deepmerge(mergedResolvers, currentResolver),
    {}
  ) as TopLevelResolverMap;
};
