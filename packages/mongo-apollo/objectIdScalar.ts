import { GraphQLObjectId } from "graphql-objectid-scalar";

/**
 * NOTE: the type is ObjectID to be consistent with GraphQL "ID" type
 * Be careful with the casing
 */
export const objectIdTypeDefs = `scalar ObjectId`;

export const objectIdResolvers = {
  ObjectId: GraphQLObjectId,
};
