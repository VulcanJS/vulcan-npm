// @see https://github.com/CaptorAB/graphql-objectid-scalar
import { GraphQLObjectId } from "graphql-objectid-scalar";

/**
 * GraphQL type for a Mongo ObjectId
 *
 * Use as "typeName" in your Vulcan schema for _id, userId, or any field with relations via ids
 */
export const GraphqlObjectId = "GraphQLObjectId";

/**
 * NOTE: the type is ObjectID to be consistent with GraphQL "ID" type
 * Be careful with the casing
 */
export const objectIdTypeDefs = `
scalar ${GraphqlObjectId}

# Inspired by the String_Selector
input GraphQLObjectId_Selector {
  _eq: ${GraphQLObjectId}
  _in: [${GraphQLObjectId}!]
  _is_null: Boolean
  _neq: ${GraphqlObjectId}
}
`;

export const objectIdResolvers = {
  GraphQLObjectId,
};
