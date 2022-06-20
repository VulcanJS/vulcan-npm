// @see https://github.com/CaptorAB/graphql-objectid-scalar
import { GraphQLObjectId } from "graphql-objectid-scalar";

/**
 * NOTE: the type is ObjectID to be consistent with GraphQL "ID" type
 * Be careful with the casing
 */
export const objectIdTypeDefs = `scalar GraphQLObjectId`;

export const objectIdResolvers = {
  ObjectId: GraphQLObjectId,
};

/**
 * GraphQL type for a Mongo ObjectId
 */
export const GraphqlObjectId = "GraphQLObjectId";
