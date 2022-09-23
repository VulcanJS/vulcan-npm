import { shouldAddOriginalField } from "@vulcanjs/schema";
import {
  ResolveAsDefinition,
  QueryResolverDefinitions,
  AnyResolverMap,
  VulcanGraphqlFieldSchemaServer,
} from "./typings";
// import { buildResolveAsResolver } from "./resolvers/resolveAsResolver";
import * as relations from "./resolvers/relationResolvers";
import { withFieldPermissionCheckResolver } from "./resolvers/fieldResolver";
import { VulcanGraphqlFieldSchema } from "../typings";
import { extendType } from "../templates/extend";

/**
 * "extend" graphql type + corresponding resolverMap
 */
export interface GraphqlSchemaExtension {
  typeDefs: string;
  resolverMap: AnyResolverMap;
}
interface MainTypeDefinition {
  description?: string;
  name: string;
  args?: any;
  type: string;
  direction?: any;
  directive?: any;
}

interface ResolveAsRelation extends ResolveAsDefinition {}
interface ResolveAsCustom extends ResolveAsDefinition {}
type ResolveAs = ResolveAsCustom | ResolveAsRelation;
export interface ResolveAsField extends VulcanGraphqlFieldSchema {
  /*VulcanFieldSchema*/ resolveAs: Array<ResolveAs> | ResolveAs;
}

/** Parsed ResolveAs definition? */
interface GetResolveAsFieldsInput {
  typeName: string;
  field: ResolveAsField;
  fieldName: string;
  fieldType?: string;
  fieldDescription?: string;
  fieldDirective?: string;
  fieldArguments?: Array<{ name: string; type: string }>;
}

interface GetResolveAsFieldsOutput {
  fields: {
    mainType: Array<MainTypeDefinition>;
  };
  resolvers: Array<AnyResolverMap>;
}

/**
 *  Generate GraphQL fields and resolvers for a field with a specific resolveAs
 *  resolveAs allow to generate "virtual" fields that are queryable in GraphQL but does not exist in the database
 */
export const parseFieldResolvers = ({
  typeName,
  field,
  fieldName,
  fieldType,
  fieldDescription,
  fieldDirective,
  fieldArguments,
}: GetResolveAsFieldsInput): GetResolveAsFieldsOutput => {
  const fields: GetResolveAsFieldsOutput["fields"] = {
    mainType: [],
  };
  const resolvers: Array<QueryResolverDefinitions> = [];

  const relation = field.relation;
  const resolveAsArray = field.resolveAs
    ? Array.isArray(field.resolveAs)
      ? field.resolveAs
      : [field.resolveAs]
    : [];

  if (!(resolveAsArray.length || relation)) {
    throw new Error(
      `Neither resolver nor relation is defined for field ${fieldName} of model ${typeName}.`
    );
  }
  // NOTE: technically, we could support it as long as the resolveAs are creating fields that don't
  // clash with the relation
  // But until we have a more powerful check for this we might prefer to protect the user from misuse
  if (resolveAsArray.length && relation) {
    throw new Error(
      `Defined both a custom resolver and a relation for field ${fieldName} of model ${typeName}.`
    );
  }

  // relation
  if (relation) {
    const relationResolver = relations[relation.kind]({
      fieldName,
      relation,
    });
    const resolver = withFieldPermissionCheckResolver(field, relationResolver);
    // then build actual resolver object and pass it to addGraphQLResolvers
    const resolverName = relation.fieldName;
    // { Person: { adress: hasOneResolver }}
    const resolverDefinition = {
      [typeName]: {
        [resolverName]: resolver,
      },
    };
    resolvers.push(resolverDefinition);
    // add the original field systematically for relations
    if (fieldType) {
      fields.mainType.push({
        description: fieldDescription,
        name: fieldName,
        args: fieldArguments,
        type: fieldType,
        directive: fieldDirective,
      });
    }
    // add the resolved field "Foo { resolvedField }"
    fields.mainType.push({
      //description: resolveAs.description,
      name: resolverName,
      //args: resolveAs.arguments,
      type:
        "model" in relation
          ? relation.model.graphql.typeName
          : relation.typeName, //,
      //type: fieldGraphQLType,
    });
    // resolveAs with custom resolution(s)
  } else if (resolveAsArray) {
    // check if original (main schema) field should be added to GraphQL schema
    const addOriginalField = shouldAddOriginalField(fieldName, field);
    if (addOriginalField && fieldType) {
      fields.mainType.push({
        description: fieldDescription,
        name: fieldName,
        args: fieldArguments,
        type: fieldType,
        directive: fieldDirective,
      });
    }

    resolveAsArray.forEach((resolveAs) => {
      // get resolver name from resolveAs object, or else default to field name
      const resolverName = resolveAs.fieldName || fieldName;
      const customResolver = resolveAs.resolver;

      // use specified GraphQL type or else convert schema type
      const fieldGraphQLType =
        resolveAs.typeName || resolveAs.type || fieldType;

      // if resolveAs is an object, first push its type definition
      // include arguments if there are any
      // note: resolved fields are not internationalized
      if (fieldGraphQLType) {
        fields.mainType.push({
          description: resolveAs.description,
          name: resolverName,
          args: resolveAs.arguments,
          type: fieldGraphQLType,
        });
      }
      // then build actual resolver object and pass it to addGraphQLResolvers
      const resolver =
        customResolver &&
        withFieldPermissionCheckResolver(field, customResolver);
      const resolverDefinition = {
        [typeName]: {
          [resolverName]: resolver,
        },
      };
      resolvers.push(resolverDefinition);
    });
  }
  return { fields, resolvers };
};

/**
 * Extends another model with a new "virtual" field
 */
export const parseReversedRelation = ({
  field,
  fieldName,
  typeName,
  currentModel,
}: {
  field: VulcanGraphqlFieldSchemaServer;
  /** Fieldname of the CURRENT model */
  fieldName: string;
  /** TypeName of the CURRENT model */
  typeName: string;
  currentModel;
}): GraphqlSchemaExtension => {
  if (!field.reversedRelation)
    throw new Error(
      `Tried to parse a field with no reversed relation: ${field.typeName}`
    );
  const { reversedRelation } = field;
  const { model, foreignFieldName } = reversedRelation;
  const foreignTypeName = model.graphql.typeName;
  const resolverMap = {
    [foreignTypeName]: {
      [foreignFieldName]: relations.reversed({
        fieldName,
        reversedRelation,
        relatedModel: currentModel,
      }),
    },
  };
  const typeDefs = extendType({ foreignTypeName, foreignFieldName, typeName });
  return {
    typeDefs,
    resolverMap,
  };
};
