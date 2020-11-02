/**
 * Parse the model query and mutation resolvers
 *
 */
import { MutableFieldsDefinitions } from "./parseSchema";
import {
  singleQueryTemplate,
  multiQueryTemplate,
  createMutationTemplate,
  updateMutationTemplate,
  deleteMutationTemplate,
} from "../templates";
import { camelCaseify } from "@vulcanjs/utils";
import {
  MutationResolverMap,
  QueryResolverMap,
  QueryTypeDefinition,
  MutationTypeDefinition,
  QueryResolverDefinitions,
  MutationResolverDefinitions,
} from "./typings";

interface CreateResolversInput {
  queryResolverDefinitions: QueryResolverDefinitions;
  typeName: string;
  multiTypeName: string;
}
export interface ParsedModelQueryResolvers {
  // Graphql typeDef
  queries: Array<QueryTypeDefinition>;
  // Functions
  queryResolvers: QueryResolverMap;
}
/**
 * Compute query resolvers for a given model
 */
export const parseQueryResolvers = ({
  queryResolverDefinitions,
  typeName,
  multiTypeName,
}: CreateResolversInput): ParsedModelQueryResolvers => {
  const queryResolvers: QueryResolverMap = {};
  const queries: Array<{ description: string; query: string }> = [];
  if (!queryResolverDefinitions) {
    return { queries, queryResolvers };
  }
  // single
  if (queryResolverDefinitions?.single) {
    const { single } = queryResolverDefinitions;
    queries.push({
      query: singleQueryTemplate({ typeName }),
      description: single.description,
    });
    queryResolvers[camelCaseify(typeName)] = single.resolver.bind(single);
  }
  // multi
  if (queryResolverDefinitions?.multi) {
    const { multi } = queryResolverDefinitions;
    queries.push({
      query: multiQueryTemplate({ typeName, multiTypeName }),
      description: multi.description,
    });
    queryResolvers[camelCaseify(multiTypeName)] = multi.resolver.bind(multi);
  }
  return {
    queries,
    queryResolvers,
  };
};
interface CreateMutationsInput {
  mutationDefinitions?: MutationResolverDefinitions;
  typeName: string;
  modelName: string;
  // createable/updateable fields
  fields: MutableFieldsDefinitions;
}
export interface ParsedModelMutationResolvers {
  mutations: Array<MutationTypeDefinition>;
  mutationResolvers: MutationResolverMap;
}
/**
 * Create mutation resolvers for a model
 */
export const parseMutationResolvers = ({
  mutationDefinitions,
  typeName,
  modelName,
  fields,
}: CreateMutationsInput): ParsedModelMutationResolvers => {
  const mutationResolvers: MutationResolverMap = {};
  const mutations: ParsedModelMutationResolvers["mutations"] = [];
  if (!mutationDefinitions) {
    return { mutationResolvers, mutations };
  }

  // create
  if (mutationDefinitions.create) {
    // e.g. "createMovie(input: CreateMovieInput) : Movie"
    const { create } = mutationDefinitions;
    if (fields.create.length === 0) {
      // check that there actually are createable fields
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined a "create" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "create" mutation or define a "canCreate" property on a field to disable this warning`
      );
    } else {
      //addGraphQLMutation(createMutationTemplate({ typeName }), mutations.create.description);
      mutations.push({
        mutation: createMutationTemplate({ typeName }),
        description: create.description,
      });
      mutationResolvers[`create${typeName}`] = create.mutation.bind(create);
    }
  }
  // update
  if (mutationDefinitions.update) {
    const { update } = mutationDefinitions;
    // e.g. "updateMovie(input: UpdateMovieInput) : Movie"
    // check that there actually are updateeable fields
    if (fields.update.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined an "update" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "update" mutation or define a "canUpdate" property on a field to disable this warning`
      );
    } else {
      mutations.push({
        mutation: updateMutationTemplate({ typeName }),
        description: update.description,
      });
      //addGraphQLMutation(updateMutationTemplate({ typeName }), mutations.update.description);
      mutationResolvers[`update${typeName}`] = update.mutation.bind(update);
    }
  }
  // delete
  if (mutationDefinitions.delete) {
    // e.g. "deleteMovie(input: DeleteMovieInput) : Movie"
    //addGraphQLMutation(deleteMutationTemplate({ typeName }), mutations.delete.description);
    mutations.push({
      mutation: deleteMutationTemplate({ typeName }),
      description: mutationDefinitions.delete.description,
    });
    mutationResolvers[
      `delete${typeName}`
    ] = mutationDefinitions.delete.mutation.bind(mutationDefinitions.delete);
  }
  //addGraphQLResolvers({ Mutation: { ...mutationResolvers } });
  return { mutationResolvers, mutations };
};
