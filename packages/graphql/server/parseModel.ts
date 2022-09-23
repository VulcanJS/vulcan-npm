/**
 */
import {
  parseSchema,
  ParseSchemaOutput,
  QueriableFieldsDefinitions,
} from "./parseSchema";
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
  // enumTypeTemplate,
  fieldFilterInputTemplate,
  fieldSortInputTemplate,
  customFilterTemplate,
  // customSortTemplate, // not currently used
  //nestedInputTemplate,
} from "../templates";

import _isEmpty from "lodash/isEmpty.js";
import _initial from "lodash/initial.js";
import { VulcanGraphqlModel } from "../typings";
import { VulcanGraphqlModelServer } from "./typings";
import { ModelResolverMap, AnyResolverMap } from "./typings";
import {
  ParsedModelMutationResolvers,
  ParsedModelQueryResolvers,
  parseMutationResolvers,
  parseQueryResolvers,
} from "./parseModelResolvers";

interface Fields extends QueriableFieldsDefinitions {
  mainType: any;
  create: Array<any>;
  update: Array<any>;
  // selector: Array<any>;
  // selectorUnique: Array<any>;
  // readable: Array<any>;
  // filterable: Array<any>;
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
  const schemaFragments: Array<string> = [];
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

  if (!(model?.graphql.typeName || typeNameArgs))
    throw new Error(
      `model.graphql.typeName is undefined, please provide typeName as arguments in generateTypeDefs`
    );
  const typeName = model ? model.graphql.typeName : (typeNameArgs as string);

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

  const idTypeName = model?.schema._id?.typeName || "String";
  schemaFragments.push(
    singleInputTemplate({
      typeName,
      idTypeName,
      hasSelector: !!selectorUnique.length,
    })
  );
  schemaFragments.push(multiInputTemplate({ typeName }));
  schemaFragments.push(singleOutputTemplate({ typeName }));
  schemaFragments.push(multiOutputTemplate({ typeName }));
  schemaFragments.push(mutationOutputTemplate({ typeName }));

  schemaFragments.push(deleteInputTemplate({ typeName, idTypeName }));

  if (create.length) {
    schemaFragments.push(createInputTemplate({ typeName }));
    schemaFragments.push(createDataInputTemplate({ typeName, fields: create }));
  }

  if (update.length) {
    schemaFragments.push(updateInputTemplate({ typeName, idTypeName }));
    schemaFragments.push(upsertInputTemplate({ typeName, idTypeName }));
    schemaFragments.push(updateDataInputTemplate({ typeName, fields: update }));
  }

  if (filterable.length) {
    // TODO: reneable customFilters?
    // FIXME: .crud exists only for server models, but here we accept both types
    // We should enhance VulcanGraphqlModel to fix that somehow
    const customFilters =
      (model as VulcanGraphqlModelServer)?.crud?.customFilters || []; //collection.options.customFilters;
    schemaFragments.push(
      fieldFilterInputTemplate({ typeName, fields: filterable, customFilters })
    );
    //console.log(
    //  fieldFilterInputTemplate({ typeName, fields: filterable, customFilters })
    //);
    if (customFilters?.length) {
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

  if (selector.length) {
    schemaFragments.push(selectorInputTemplate({ typeName, fields: selector }));
  } else {
    console.warn(
      `No selectable field in your schema for model ${model?.name}, is _id correctly defined?`
    );
  }

  if (selectorUnique.length) {
    schemaFragments.push(
      selectorUniqueInputTemplate({ typeName, fields: selectorUnique })
    );
  } else {
    console.warn(
      `No unique selectable field in your schema for model ${model?.name}, is _id correctly defined?`
    );
  }

  return schemaFragments;
};

interface ParseModelOutput
  extends Partial<Pick<ParsedModelMutationResolvers, "mutations">>,
    Partial<Pick<ParsedModelQueryResolvers, "queries">> {
  typeDefs: string;
  schemaResolvers?: Array<AnyResolverMap>;
  resolvers?: ModelResolverMap;
}

const modelTypefs = (
  model: VulcanGraphqlModelServer,
  parsedSchema: ParseSchemaOutput
): string => {
  const { nestedFieldsList, fields, schemaExtensions } = parsedSchema;
  const typeDefs: Array<string> = [];
  // typedefs
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
          fields: nestedFields.fields as Fields,
          isNested: true,
        })
      );
    }
  }
  // extending other models
  if (schemaExtensions.length) {
    schemaExtensions.forEach((schemaExtension) => {
      typeDefs.push(schemaExtension.typeDefs);
    });
  }
  const mergedTypeDefs = typeDefs.join("\n\n") + "\n\n\n";
  return mergedTypeDefs;
};

const modelResolverMap = (
  model: VulcanGraphqlModelServer,
  parsedSchema: ParseSchemaOutput
) => {
  const { schema, name: modelName } = model;
  const { typeName, multiTypeName } = model.graphql;
  const { fields, resolvers: schemaResolvers, schemaExtensions } = parsedSchema;

  let resolvers: ModelResolverMap = {};
  let queries;
  let mutations;

  const queryDefinitions = model.graphql?.queryResolvers; // TODO: get from Model?
  const mutationDefinitions = model.graphql?.mutationResolvers; // TODO: get from Model?
  if (queryDefinitions) {
    const parsedQueries = parseQueryResolvers({
      queryResolverDefinitions: queryDefinitions,
      typeName,
      multiTypeName,
    });
    queries = parsedQueries.queries;
    resolvers.Query = parsedQueries.queryResolvers;
  }
  if (mutationDefinitions) {
    const parsedMutations = parseMutationResolvers({
      mutationDefinitions,
      typeName,
      modelName,
      fields,
    });
    mutations = parsedMutations.mutations;
    resolvers.Mutation = parsedMutations.mutationResolvers;
  }

  if (schemaExtensions.length) {
    schemaExtensions.forEach((schemaExtension) => {
      resolvers = {
        ...(resolvers || {}),
        ...schemaExtension.resolverMap,
      };
    });
  }

  return { queries, mutations, resolvers };
};

export const parseModel = (
  model: VulcanGraphqlModelServer
): ParseModelOutput => {
  const { schema, name: modelName } = model;
  const { typeName, multiTypeName } = model.graphql;

  const parsedSchema = parseSchema(schema, typeName, model);
  const { fields, resolvers: schemaResolvers, schemaExtensions } = parsedSchema;

  const { mainType } = fields;
  if (!mainType.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `// Warning: model ${model.name} doesn't have any GraphQL-enabled fields, so no corresponding type can be generated. Pass generateGraphQLSchema = false to createCollection() to disable this warning`
    );
    return { typeDefs: "" };
  }

  const typeDefs = modelTypefs(model, parsedSchema);
  const { queries, mutations, resolvers } = modelResolverMap(
    model,
    parsedSchema
  );

  return {
    typeDefs,
    queries,
    mutations,
    schemaResolvers,
    resolvers,
  };
};

export default parseModel;
