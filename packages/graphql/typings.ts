import { VulcanModel } from "@vulcanjs/model";
import { OperationVariables } from "@apollo/client";
import { VulcanFieldSchema, VulcanSchema } from "@vulcanjs/schema";
import type { FilterableInput /*, VulcanCrudModel*/ } from "@vulcanjs/crud";

// SCHEMA TYPINGS
// Custom resolver

/**
 * @example       field: {
        type: String,
        optional: true,
        canRead: ["admins"],
        resolveAs: {
          fieldName: "resolvedField",
          type: "Bar",
          resolver: async (root, args, context) => {
            return `Variable value is ${args?.variable}`;
          },
          arguments: "variable: String",
          description: "Some field",
          typeName: "String",
          addOriginalField: true,
        },
      }
 */
interface RelationDefinitionBase {
  fieldName: string;
  kind: "hasOne" | "hasMany";
}
export type RelationDefinition =
  | (RelationDefinitionBase & {
      /**
       * @deprecated Use model instaed
       * Model can be recovered from the typeName in resolvers*/
      typeName: string;
    })
  | (RelationDefinitionBase & {
      /** Pass the model directly instead of just the graphql typename */
      model: VulcanGraphqlModel;
    });

export type ReversedRelationDefinition = {
  model: VulcanGraphqlModel;
  kind: "hasOne" | "hasMany";
  /**
   * Field name as it will appear in the GraphQL schema of the foreign model
   */
  foreignFieldName: String;
};
export interface VulcanGraphqlFieldSchema extends VulcanFieldSchema {
  /**
   * Direct relation to another model, based on the field value
   * Usually "fooId" in Bar will point to a "Foo" ; fooIds to a list of "Foos"
   */
  relation?: RelationDefinition;
  /**
   * A reversed relation is when "Bar" extends the schema of "Foo",
   * so that "Foo" can resolve a "Bar"
   *
   * This is useful if "Bar" is an extension to "Foo", eg a new field
   * that is only available for administration purpose but not part of the core model
   *
   * See Devographics "NormalizedResponse" (admin-only) vs "Response" (core + admin)
   */
  reversedRelation?: ReversedRelationDefinition;
  typeName?: string; // the GraphQL type to resolve the field with

  // TODO: not sure about the arguments in function mode
  query?: string | (() => string); // field-specific data loading query
  autocompleteQuery?: string | (() => string); // query used to populate autocomplete
}
// Base schema + GraphQL Fields
export type VulcanGraphqlSchema = VulcanSchema<VulcanGraphqlFieldSchema>;

// MODEL TYPINGS
// Those typings extends the raw model/schema system
export interface VulcanGraphqlModelSkeleton extends VulcanModel {
  graphql: Pick<GraphqlModel, "typeName">;
}

// information relevant for server and client
export interface GraphqlModel {
  typeName: string;
  multiTypeName: string; // plural name for the multi resolver
  multiResolverName: string;
  singleResolverName: string;
  defaultFragment?: string;
  defaultFragmentName?: string;
}
// Client only model fields
// interface GraphqlClientModel extends GraphqlModel {}

// TODO: not used yet. A schema for graphql might contain those additional fields.
// export interface VulcanFieldSchemaGraphql extends VulcanFieldSchema {
//   relation;
//   resolveAs;
// }
// Extended model with extended schema
export interface VulcanGraphqlModel
  extends VulcanModel<VulcanGraphqlSchema> /*, VulcanCrudModel*/ {
  graphql: GraphqlModel;
}

// Wrap input type, so the input is in the "input" field as an object
export interface ApolloVariables<TInput> {
  input: TInput;
}

// Inputs
export interface SingleInput<TModel = any> extends QueryInput<TModel> {
  id?: string;
  allowNull?: boolean; // if false, throw an error when not found
  filterArguments?: Object;
}
export interface SingleVariables<TModel = any> extends OperationVariables {
  _id?: string;
  input?: SingleInput;
}
export interface MultiInput<TModel = any> extends QueryInput<TModel> {
  enableTotal?: boolean;
}
export interface MultiVariables<TModel = any> extends OperationVariables {
  input: MultiInput<TModel>;
}
// Generic query inputs
export interface QueryInput<TModel = any> extends FilterableInput<TModel> {
  enableCache?: boolean; // cache the query, server-side
}
