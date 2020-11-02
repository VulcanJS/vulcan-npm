/**
 */
import { parseSchema } from "./parseSchema";
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

import _isEmpty from "lodash/isEmpty";
import _initial from "lodash/initial";
import { VulcanGraphqlModel } from "../typings";
import { ModelResolverMap, AnyResolverMap } from "./typings";
import {
  ParsedModelMutationResolvers,
  ParsedModelQueryResolvers,
  parseMutationResolvers,
  parseQueryResolvers,
} from "./parseModelResolvers";

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
  extends Partial<Pick<ParsedModelMutationResolvers, "mutations">>,
    Partial<Pick<ParsedModelQueryResolvers, "queries">> {
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

  // resolvers
  const queryDefinitions = model.graphql.queryResolvers; // TODO: get from Model?
  const mutationDefinitions = model.graphql.mutationResolvers; // TODO: get from Model?
  const { queries, queryResolvers } = parseQueryResolvers({
    queryResolverDefinitions: queryDefinitions,
    typeName,
    multiTypeName,
  });
  const { mutations, mutationResolvers } = parseMutationResolvers({
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
