// @see https://github.com/CaptorAB/graphql-objectid-scalar
import { GraphQLObjectId } from "graphql-objectid-scalar";
import { GraphQLObjectIdTypeName } from "../graphqlObjectId";

/**
 * NOTE: the type is ObjectID to be consistent with GraphQL "ID" type
 * Be careful with the casing
 */
export const objectIdTypeDefs = `
scalar ${GraphQLObjectIdTypeName}

# Inspired by the String_Selector
input GraphQLObjectId_Selector {
  _eq: ${GraphQLObjectIdTypeName}
  _in: [${GraphQLObjectIdTypeName}!]
  _is_null: Boolean
  _neq: ${GraphQLObjectIdTypeName}
}
`;

export const objectIdResolvers = {
  GraphQLObjectId,
};
