/**
 */
// import { getDefaultMutationResolvers } from "./defaultMutationResolvers";
// import { getDefaultQueryResolvers } from "./defaultQueryResolvers";
import { MutableFieldsDefinitions, parseSchema } from "./parseSchema";
import {
  selectorInputTemplate,
  mainTypeTemplate,
  createInputTemplate,
  createDataInputTemplate,
  updateInputTemplate,
  updateDataInputTemplate,
  selectorUniqueInputTemplate,
  deleteInputTemplate,
  upsertInputTemplate,
  singleInputTemplate,
  multiInputTemplate,
  multiOutputTemplate,
  singleOutputTemplate,
  mutationOutputTemplate,
  singleQueryTemplate,
  multiQueryTemplate,
  createMutationTemplate,
  updateMutationTemplate,
  upsertMutationTemplate,
  deleteMutationTemplate,
  // enumTypeTemplate,
  fieldFilterInputTemplate,
  fieldSortInputTemplate,
  customFilterTemplate,
  // customSortTemplate, // not currently used
  //nestedInputTemplate,
} from "../templates";

import _isEmpty from "lodash/isEmpty";
import _initial from "lodash/initial";
import { VulcanGraphqlModel } from "../typings";
import { camelCaseify } from "@vulcanjs/utils";
import {
  QueryResolver,
  ModelResolverMap,
  MutationResolver,
  MutationResolverMap,
  QueryResolverMap,
  QuerySchema,
  MutationSchema,
  AnyResolverMap,
  QueryResolverDefinitions,
  MutationResolverDefinitions,
} from "./typings";

interface CreateResolversInput {
  resolverDefinitions: QueryResolverDefinitions;
  typeName: string;
  multiTypeName: string;
}
interface CreateResolversOutput {
  // Graphql typeDef
  queries: Array<QuerySchema>; // [query typedef, description]
  // Functions
  queryResolvers: QueryResolverMap;
}
/**
 * Compute query resolvers for a given model
 */
const createResolvers = ({
  resolverDefinitions,
  typeName,
  multiTypeName,
}: CreateResolversInput): CreateResolversOutput => {
  const queryResolvers: QueryResolverMap = {};
  const queries: Array<{ description: string; query: string }> = [];
  if (resolverDefinitions === null) {
    // user explicitely don't want resolvers
    return { queries, queryResolvers };
  }
  // REMOVED FEATURE: if resolvers are empty, use defaults
  // => we expect user to provide default resolvers explicitely (or we compute them earlier, here it's too far)
  /*const resolvers = _isEmpty(providedResolvers)
    ? getDefaultQueryResolvers({ typeName })
    : providedResolvers;*/
  // single
  if (resolverDefinitions.single) {
    queries.push({
      query: singleQueryTemplate({ typeName }),
      description: resolverDefinitions.single.description,
    });
    //addGraphQLQuery(singleQueryTemplate({ typeName }), resolvers.single.description);
    queryResolvers[
      camelCaseify(typeName)
    ] = resolverDefinitions.single.resolver.bind(resolverDefinitions.single);
  }
  // multi
  if (resolverDefinitions.multi) {
    queries.push({
      query: multiQueryTemplate({ typeName, multiTypeName }),
      description: resolverDefinitions.multi.description,
    });
    //addGraphQLQuery(multiQueryTemplate({ typeName }), resolvers.multi.description);
    queryResolvers[
      camelCaseify(multiTypeName)
    ] = resolverDefinitions.multi.resolver.bind(resolverDefinitions.multi);
  }
  //addGraphQLResolvers({ Query: { ...queryResolvers } });
  // resolversToAdd.push({ Query: { ...queryResolvers } });
  return {
    queries,
    queryResolvers,
  };
};

interface CreateMutationsInput {
  mutationDefinitions: {
    create?: { description?: string; mutation: MutationResolver };
    update?: { description?: string; mutation: MutationResolver };
    upsert?: { description?: string; mutation: MutationResolver };
    delete?: { description?: string; mutation: MutationResolver };
  };
  typeName: string;
  modelName: string;
  fields: MutableFieldsDefinitions;
}
interface CreateMutationsOutput {
  mutations: Array<MutationSchema>;
  mutationResolvers: MutationResolverMap;
}
/**
 * Create mutation resolvers for a model
 */
const createMutations = ({
  mutationDefinitions,
  typeName,
  modelName,
  fields,
}: CreateMutationsInput): CreateMutationsOutput => {
  const mutationResolvers: MutationResolverMap = {};
  const mutations: CreateMutationsOutput["mutations"] = [];
  if (mutationDefinitions === null) {
    // user explicitely disabled mutations
    return { mutationResolvers, mutations };
  }
  // WE EXPECT mutations to be passed now
  // if mutations are undefined, use defaults
  /*
  const mutations = _isEmpty(providedMutations)
    ? getDefaultMutationResolvers({ typeName })
    : providedMutations;
    */

  const { create, update } = fields;

  // create
  if (mutationDefinitions.create) {
    // e.g. "createMovie(input: CreateMovieInput) : Movie"
    if (create.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined a "create" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "create" mutation or define a "canCreate" property on a field to disable this warning`
      );
    } else {
      //addGraphQLMutation(createMutationTemplate({ typeName }), mutations.create.description);
      mutations.push({
        mutation: createMutationTemplate({ typeName }),
        description: mutationDefinitions.create.description,
      });
      mutationResolvers[
        `create${typeName}`
      ] = mutationDefinitions.create.mutation.bind(mutationDefinitions.create);
    }
  }
  // update
  if (mutationDefinitions.update) {
    // e.g. "updateMovie(input: UpdateMovieInput) : Movie"
    if (update.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined an "update" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "update" mutation or define a "canUpdate" property on a field to disable this warning`
      );
    } else {
      mutations.push({
        mutation: updateMutationTemplate({ typeName }),
        description: mutationDefinitions.update.description,
      });
      //addGraphQLMutation(updateMutationTemplate({ typeName }), mutations.update.description);
      mutationResolvers[
        `update${typeName}`
      ] = mutationDefinitions.update.mutation.bind(mutationDefinitions.update);
    }
  }
  // upsert
  if (mutationDefinitions.upsert) {
    // e.g. "upsertMovie(input: UpsertMovieInput) : Movie"
    if (update.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        `// Warning: you defined an "upsert" mutation for model ${modelName}, but it doesn't have any mutable fields, so no corresponding mutation types can be generated. Remove the "upsert" mutation or define a "canUpdate" property on a field to disable this warning`
      );
    } else {
      mutations.push({
        mutation: upsertMutationTemplate({ typeName }),
        description: mutationDefinitions.upsert.description,
      });
      //addGraphQLMutation(upsertMutationTemplate({ typeName }), mutations.upsert.description);
      mutationResolvers[
        `upsert${typeName}`
      ] = mutationDefinitions.upsert.mutation.bind(mutationDefinitions.upsert);
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

interface Fields {
  mainType: any;
  create: Array<any>;
  update: Array<any>;
  selector: any;
  selectorUnique: any;
  readable: Array<any>;
  filterable: Array<any>;
  // enums: Array<{ allowedValues: Array<any>; typeName: string }>;
}
interface GenerateSchemaFragmentsInput {
  model?: VulcanGraphqlModel;
  typeName?: string;
  description?: string;
  interfaces?: Array<any>;
  fields: Fields;
  isNested?: boolean;
}
// generate types, input and enums
const generateTypeDefs = ({
  model,
  typeName: typeNameArgs,
  description,
  interfaces = [],
  fields,
  isNested = false,
}: GenerateSchemaFragmentsInput): Array<string> => {
  const schemaFragments = [];
  const {
    mainType,
    create,
    update,
    selector,
    selectorUnique,
    //orderBy,
    readable,
    filterable,
    // enums,
  } = fields;

  const typeName = model ? model.graphql.typeName : typeNameArgs;

  if (!mainType || mainType.length === 0) {
    throw new Error(
      `GraphQL type ${typeName} has no readable fields. Please add readable fields or remove the type.`
    );
  }

  schemaFragments.push(
    mainTypeTemplate({ typeName, description, interfaces, fields: mainType })
  );

  /*
  FEATURE REMOVED enum do not work as expected
  if (enums) {
    for (const { allowedValues, typeName: enumTypeName } of enums) {
      schemaFragments.push(
        enumTypeTemplate({ typeName: enumTypeName, allowedValues })
      );
    }
  }
  */
  if (isNested) {
    // TODO: this is wrong because the mainType includes resolveAs fields
    // + this input type does not seem to be actually used?
    // schemaFragments.push(nestedInputTemplate({ typeName, fields: mainType }));

    //schemaFragments.push(deleteInputTemplate({ typeName }));
    //schemaFragments.push(singleInputTemplate({ typeName }));
    //schemaFragments.push(multiInputTemplate({ typeName }));
    //schemaFragments.push(singleOutputTemplate({ typeName }));
    //schemaFragments.push(multiOutputTemplate({ typeName }));
    //schemaFragments.push(mutationOutputTemplate({ typeName }));

    if (create.length) {
      schemaFragments.push(createInputTemplate({ typeName }));
      schemaFragments.push(
        createDataInputTemplate({ typeName, fields: create })
      );
    }

    if (update.length) {
      schemaFragments.push(updateInputTemplate({ typeName }));
      schemaFragments.push(upsertInputTemplate({ typeName }));
      schemaFragments.push(
        updateDataInputTemplate({ typeName, fields: update })
      );
    }
    if (filterable.length) {
      schemaFragments.push(
        fieldFilterInputTemplate({ typeName, fields: filterable })
      );
      schemaFragments.push(
        fieldSortInputTemplate({ typeName, fields: filterable })
      );
    }

    //   schemaFragments.push(selectorInputTemplate({ typeName, fields: selector }));

    //    schemaFragments.push(selectorUniqueInputTemplate({ typeName, fields: selectorUnique }));

    //    schemaFragments.push(orderByInputTemplate({ typeName, fields: orderBy }));
    return schemaFragments; // return now
  }

  schemaFragments.push(singleInputTemplate({ typeName }));
  schemaFragments.push(multiInputTemplate({ typeName }));
  schemaFragments.push(singleOutputTemplate({ typeName }));
  schemaFragments.push(multiOutputTemplate({ typeName }));
  schemaFragments.push(mutationOutputTemplate({ typeName }));

  schemaFragments.push(deleteInputTemplate({ typeName }));

  if (create.length) {
    schemaFragments.push(createInputTemplate({ typeName }));
    schemaFragments.push(createDataInputTemplate({ typeName, fields: create }));
  }

  if (update.length) {
    schemaFragments.push(updateInputTemplate({ typeName }));
    schemaFragments.push(upsertInputTemplate({ typeName }));
    schemaFragments.push(updateDataInputTemplate({ typeName, fields: update }));
  }

  if (filterable.length) {
    // TODO: reneable customFilters?
    const customFilters = undefined; //collection.options.customFilters;
    schemaFragments.push(
      fieldFilterInputTemplate({ typeName, fields: filterable, customFilters })
    );
    if (customFilters) {
      customFilters.forEach((filter) => {
        schemaFragments.push(customFilterTemplate({ typeName, filter }));
      });
    }
    // TODO: reenable customSorts
    const customSorts = undefined; // collection.options.customSorts;
    schemaFragments.push(
      fieldSortInputTemplate({ typeName, fields: filterable }) //, customSorts })
    );
    // TODO: not currently working
    // if (customSorts) {
    //   customSorts.forEach(sort => {
    //     schemaFragments.push(customSortTemplate({ typeName, sort }));
    //   });
    // }
  }

  schemaFragments.push(selectorInputTemplate({ typeName, fields: selector }));

  schemaFragments.push(
    selectorUniqueInputTemplate({ typeName, fields: selectorUnique })
  );

  return schemaFragments;
};

interface ParseModelOutput
  extends Partial<Pick<CreateMutationsOutput, "mutations">>,
    Partial<Pick<CreateResolversOutput, "queries">> {
  typeDefs: string;
  schemaResolvers?: Array<AnyResolverMap>;
  resolvers?: ModelResolverMap;
}
export const parseModel = (model: VulcanGraphqlModel): ParseModelOutput => {
  const typeDefs = [];

  // const {
  //   collectionName,
  //   description,
  //   interfaces = [],
  //   resolvers,
  //   mutations,
  // } = getCollectionInfos(collection);
  const resolverDefinitions = null; // TODO: get from Model?
  const mutationDefinitions = null; // TODO: get from Model?
  const { schema, name: modelName } = model;
  const { typeName, multiTypeName } = model.graphql;

  const { nestedFieldsList, fields, resolvers: schemaResolvers } = parseSchema(
    schema,
    typeName
  );

  const { mainType } = fields;

  if (!mainType.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `// Warning: model ${model.name} doesn't have any GraphQL-enabled fields, so no corresponding type can be generated. Pass generateGraphQLSchema = false to createCollection() to disable this warning`
    );
    return { typeDefs: "" };
  }
  typeDefs.push(
    ...generateTypeDefs({
      model,
      // description,
      // interfaces,
      fields,
      isNested: false,
    })
  );
  /* NESTED */
  // TODO: factorize to use the same function as for non nested fields
  // the schema may produce a list of additional graphQL types for nested arrays/objects
  if (nestedFieldsList) {
    for (const nestedFields of nestedFieldsList) {
      typeDefs.push(
        ...generateTypeDefs({
          typeName: nestedFields.typeName,
          fields: nestedFields.fields,
          isNested: true,
        })
      );
    }
  }

  const { queries, queryResolvers } = createResolvers({
    resolverDefinitions,
    typeName,
    multiTypeName,
  });
  const { mutations, mutationResolvers } = createMutations({
    mutationDefinitions,
    typeName,
    modelName,
    fields,
  });

  const resolvers = {
    Query: queryResolvers,
    Mutation: mutationResolvers,
  };
  const mergedTypeDefs = typeDefs.join("\n\n") + "\n\n\n";

  return {
    typeDefs: mergedTypeDefs,
    queries,
    mutations,
    schemaResolvers,
    resolvers,
  };
};

export default parseModel;
