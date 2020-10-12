/**
 * Generates the Graphql schema
 * (in the form of a string template)
 *
 * Previously was the main GraphQL object
 */
import deepmerge from "deepmerge";
import GraphQLJSON from "graphql-type-json";
import GraphQLDate from "graphql-date";
//import Vulcan from '../config.js'; // used for global export
import { disableFragmentWarnings } from "graphql-tag";

// import parseModel from "./parseModel";
import generateResolversFromSchema from "./resolvers";
import {
  mainTypeTemplate,
  createDataInputTemplate,
  updateDataInputTemplate,
  //   fieldSortInputTemplate,
} from "../templates";
import parseSchema from "./parseSchema";
import parseModel from "./parseModel";
import { VulcanSchema } from "@vulcanjs/schema";
import { ModelResolverMap, ResolverMap, ResolversDefinitions } from "./typings";
import { VulcanGraphqlModel } from "../typings";

disableFragmentWarnings();

// import { getDefaultResolvers } from "../../server/default_resolvers.js";
// import { getDefaultMutations } from "../../server/default_mutations.js";
// import isEmpty from "lodash/isEmpty";
// import { Collections } from "../../modules/collections.js";

const defaultResolvers = {
  JSON: GraphQLJSON,
  Date: GraphQLDate,
};

type GenerateGraphqlSchemaInput = {
  typeName: string;
  schema: VulcanSchema;
  description?: string;
  interfaces?: Array<any>; // ?? what is it
};

interface GenerateGraphqlSchemaOutput {
  typeDefs: Array<string>;
  resolvers: ModelResolverMap;
}

const mergeResolvers = (
  resolversList: ResolversDefinitions
): ModelResolverMap => {
  return resolversList.reduce(
    (mergedResolvers, currentResolver) =>
      deepmerge(mergedResolvers, currentResolver),
    {}
  );
};
/**
 * Generate typeDefs and resolvers for all models listed
 * @param models
 */
// TODO: do we need this??? Probably not, now it is handled by parseModel
/*
const generateModelGraphqlSchema = (
  model: GenerateGraphqlSchemaInput
): GenerateGraphqlSchemaOutput => {
  const typeDefs: Array<string> = [];
  const resolversList: ResolversDefinitions = [];
  const { typeName, schema, description = "", interfaces = [] } = model;
  const { fields, resolvers: schemaResolvers = [] } = parseSchema(
    schema,
    typeName
  );
  const mainType = fields.mainType;
  if (!mainType || mainType.length === 0) {
    throw new Error(
      `GraphQL type ${typeName} has no fields. Please add readable fields or remove the type.`
    );
  }
  // generate graphql typeDefs
  const modelTypeDefs = mainTypeTemplate({
    typeName,
    fields: mainType,
    description,
    interfaces,
  });
  typeDefs.push(modelTypeDefs);

  // createTypeDataInput
  if ((fields.create || []).length) {
    typeDefs.push(createDataInputTemplate({ typeName, fields: fields.create }));
  }
  // updateTypeDataInput
  if ((fields.update || []).length) {
    typeDefs.push(updateDataInputTemplate({ typeName, fields: fields.update }));
  }
  const modelResolvers: ResolverMap = generateResolversFromSchema(schema);
  // only add resolvers if there is at least one
  if (
    typeof modelResolvers === "object" &&
    Object.keys(modelResolvers).length >= 1
  ) {
    resolversList.push({ [typeName]: modelResolvers });
  }
  // add resolvers specifci to the current model
  resolversList.push(...schemaResolvers);

  const mergedResolvers: ModelResolverMap = mergeResolvers(resolversList);
  return {
    resolvers: mergedResolvers,
    typeDefs,
  };
};
*/
export const generateModelGraqhqlSchema = (
  model: VulcanGraphqlModel
): {
  typeDefs: string;
  queries: Array<{ description: string; query: string }>;
  mutations: Array<{ description: string; mutation: string }>;
  resolvers: ModelResolverMap;
} => {
  const { schema, description } = model;
  const {
    typeName,
    // interfaces = [],
    // resolvers,
    // mutations,
  } = model.graphql;

  // const { nestedFieldsList, fields, resolvers: schemaResolvers = [] } = getSchemaFields(schema._schema, typeName);

  // TODO: why do we call both???
  //const {
  //  typeDefs: generatedTypeDefs,
  //  resolvers: generatedResolvers,
  //} = generateModelGraphqlSchema({
  //  typeName,
  //  schema,
  //  description,
  //  // interfaces,
  //});
  //
  const {
    typeDefs,
    resolversToAdd = [],
    queriesToAdd = [],
    mutationsToAdd = [],
    mutationsResolversToAdd = [],
  } = parseModel(model);

  // register the generated resolvers
  // schemaResolvers.forEach(addGraphQLResolvers);
  const queries = queriesToAdd.map(([query, description]) => ({
    query,
    description,
  })); // TODO: structure them this way when parsing the model already
  const mutations = mutationsToAdd.map(([mutation, description]) => ({
    mutation,
    description,
  }));
  const resolvers = mergeResolvers(resolversToAdd);
  return {
    queries,
    mutations,
    resolvers,
    typeDefs,
  };
};

// TODO: parse all models and return the whole schema
export const parseAllModels = (models: Array<VulcanGraphqlModel>): any => {
  // TODO: call generate for each model and merge
};
