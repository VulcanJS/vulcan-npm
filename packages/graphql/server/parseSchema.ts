/**
 * Parse the Vulcan schema to prepare the graphql schema generation
 *
 */
/* eslint-disable no-console */
// import { isIntlField, isIntlDataField } from "../../modules/intl.js";
import {
  isBlackbox,
  isArrayChildField,
  unarrayfyFieldName,
  getArrayChild,
  getNestedSchema,
  shouldAddOriginalField,
  VulcanFieldSchema,
  VulcanSchema,
  hasNestedSchema,
  getArrayChildSchema,
  hasArrayNestedChild,
} from "@vulcanjs/schema";
import { getGraphQLType } from "../utils";
import { isIntlField, isIntlDataField } from "../intl";
import { capitalize } from "@vulcanjs/utils";
import {
  AnyResolverMap,
  QueryResolver,
  QueryResolverDefinitions,
  ResolverMap,
} from "./typings";
// import { buildResolveAsResolver } from "./resolvers/resolveAsResolver";
import * as relations from "./resolvers/relationResolvers";
import { withFieldPermissionCheckResolver } from "./resolvers/fieldResolver";

// get GraphQL type for a nested object (<MainTypeName><FieldName> e.g PostAuthor, EventAdress, etc.)
export const getNestedGraphQLType = (
  typeName: string,
  fieldName: string,
  isInput?: boolean
): string =>
  `${typeName}${capitalize(unarrayfyFieldName(fieldName))}${
    isInput ? "Input" : ""
  }`;

const hasTypeName = (field: VulcanFieldSchema): boolean => !!field.typeName;

const hasPermissions = (field) =>
  field.canRead || field.canCreate || field.canUpdate;
const hasLegacyPermissions = (field) => {
  const hasLegacyPermissions =
    field.viewableBy || field.insertableBy || field.editableBy;
  if (hasLegacyPermissions)
    console.warn(
      "Some field is using legacy permission fields viewableBy, insertableBy and editableBy. Please replace those fields with canRead, canCreate and canUpdate."
    );
  return hasLegacyPermissions;
};

interface ResolveAsCommon {
  fieldName?: string;
  typeName?: string;
  type?: string;
  description: string;
  arguments: any;
  resolver?: QueryResolver;
}
interface ResolveAsRelation extends ResolveAsCommon {}
interface ResolveAsCustom extends ResolveAsCommon {}
type ResolveAs = ResolveAsCustom | ResolveAsRelation;

interface ResolveAsField extends VulcanFieldSchema {
  resolveAs: Array<ResolveAs> | ResolveAs;
}
interface GetResolveAsFieldsInput {
  typeName: string;
  field: ResolveAsField;
  fieldName: string;
  fieldType?: string;
  fieldDescription?: string;
  fieldDirective: any;
  fieldArguments: any;
}
interface MainTypeDefinition {
  description?: string;
  name: string;
  args?: any;
  type: string;
  direction?: any;
  directive?: any;
}

interface GetResolveAsFieldsOutput {
  fields: {
    mainType: Array<MainTypeDefinition>;
  };
  resolvers: Array<AnyResolverMap>;
}

// Generate GraphQL fields and resolvers for a field with a specific resolveAs
// resolveAs allow to generate "virtual" fields that are queryable in GraphQL but does not exist in the database
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
      type: relation.typeName, //,
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
 * Add a prefix to a type, including an array
 * @example Create, [Foo] => [CreateFoo]
 */
const prefixType = (prefix: string, type: string): string => {
  if (!(type && type.length)) return type;
  if (type[0] === "[") return `[${prefix}${type.slice(1, -1)}]`;
  return prefix + type;
};
/**
 * Add a prefix to a type, including an array
 * @example [Foo] => [FooDataDinput]
 */
const suffixType = (type: string, suffix: string): string => {
  if (!(type && type.length)) return type;
  if (type[0] === "[") return `[${type.slice(1, -1)}${suffix}]`;
  return type + suffix;
};

interface GetPermissionFieldsInput {
  field: VulcanFieldSchema;
  fieldName: string;
  fieldType: string;
  inputFieldType: any;
  hasNesting?: boolean;
}
// Parsed representation of a field
interface FieldDefinition {
  name: string;
  type: string; // graphql type
  required?: boolean;
  description?: string; // optional description
  args?: any;
  directive?: string;
}

export interface MutableFieldsDefinitions {
  create: Array<FieldDefinition>;
  update: Array<FieldDefinition>;
  upsert?: Array<any>;
  delete?: Array<any>;
}
export interface QueriableFieldsDefinitions {
  selector: Array<FieldDefinition>;
  selectorUnique: Array<FieldDefinition>;
  sort: Array<FieldDefinition>;
  readable: Array<FieldDefinition>;
  filterable: Array<FieldDefinition>;
}
/**
 * JS Representation of the fields to include in the executable schema
 */
export interface GraphqlFieldsDefinitions
  extends MutableFieldsDefinitions,
    QueriableFieldsDefinitions {
  mainType: Array<FieldDefinition>;
  // enums: Array<FieldDefinition>;
}

// handle querying/updating permissions
/**
 * Parse fields depending on their mutability (create, update)
 * @param param0
 */
export const parseMutable = ({
  field,
  fieldName,
  fieldType,
  inputFieldType,
  hasNesting = false,
}: GetPermissionFieldsInput): MutableFieldsDefinitions => {
  const fields: MutableFieldsDefinitions = {
    create: [],
    update: [],
  };
  const { canRead, canCreate, canUpdate, selectable, unique, apiOnly } = field;
  const createInputFieldType = hasNesting
    ? suffixType(prefixType("Create", fieldType), "DataInput")
    : inputFieldType;
  const updateInputFieldType = hasNesting
    ? suffixType(prefixType("Update", fieldType), "DataInput")
    : inputFieldType;

  if (canCreate) {
    fields.create.push({
      name: fieldName,
      type: createInputFieldType,
      required: !field.optional,
    });
  }
  if (canUpdate) {
    fields.update.push({
      name: fieldName,
      type: updateInputFieldType,
    });
  }

  // if field is i18nized, add foo_intl field containing all languages
  // NOTE: not necessary anymore because intl fields are added by addIntlFields() in collections.js
  // TODO: delete if not needed
  // if (isIntlField(field)) {
  //   // fields.mainType.push({
  //   //   name: `${ fieldName } _intl`,
  //   //   type: '[IntlValue]',
  //   // });
  //   fields.create.push({
  //     name: `${ fieldName } _intl`,
  //     type: '[IntlValueInput]',
  //   });
  //   fields.update.push({
  //     name: `${ fieldName } _intl`,
  //     type: '[IntlValueInput]',
  //   });
  // }

  return fields;
};

/**
 * Parse fields depending on whether they can be queried and how
 * @param param0
 */
export const parseQueriable = ({
  field,
  fieldName,
  fieldType,
  inputFieldType,
  hasNesting = false,
}: GetPermissionFieldsInput): QueriableFieldsDefinitions => {
  const fields: QueriableFieldsDefinitions = {
    selector: [],
    selectorUnique: [],
    sort: [],
    readable: [],
    filterable: [],
  };
  const { canRead, canCreate, canUpdate, selectable, unique, apiOnly } = field;
  const createInputFieldType = hasNesting
    ? suffixType(prefixType("Create", fieldType), "DataInput")
    : inputFieldType;
  const updateInputFieldType = hasNesting
    ? suffixType(prefixType("Update", fieldType), "DataInput")
    : inputFieldType;

  // if field is readable, make it filterable/orderable too
  if (canRead) {
    fields.readable.push({
      name: fieldName,
      type: fieldType,
    });
    // we can only filter based on fields that actually exist in the db
    if (!apiOnly) {
      fields.filterable.push({
        name: fieldName,
        type: fieldType,
      });
    }
  }

  if (selectable) {
    fields.selector.push({
      name: fieldName,
      type: inputFieldType,
    });
  }

  if (selectable && unique) {
    fields.selectorUnique.push({
      name: fieldName,
      type: inputFieldType,
    });
  }

  return fields;
};

// For nested fields we also need the parent typeName
interface NestedFieldsOutput extends ParseSchemaOutput {
  typeName: string; // the parent typeName for the nested field
}

/**
 * Parsed representation of a Vulcan schema, ready for graphql typedefs and resolvers generation
 */
export interface ParseSchemaOutput {
  fields: GraphqlFieldsDefinitions;
  nestedFieldsList: Array<Partial<NestedFieldsOutput>>;
  resolvers: Array<ResolverMap>;
}
// for a given schema, return main type fields, selector fields,
// unique selector fields, sort fields, creatable fields, and updatable fields
export const parseSchema = (
  schema: VulcanSchema,
  typeName: string
): ParseSchemaOutput => {
  if (!schema) throw new Error(`No schema for typeName ${typeName}`);
  // result fields
  const fields: GraphqlFieldsDefinitions = {
    mainType: [],
    selector: [],
    selectorUnique: [],
    sort: [],
    // enums: [],
    readable: [],
    create: [],
    update: [],
    filterable: [],
  };
  const nestedFieldsList: Array<Partial<NestedFieldsOutput>> = [];
  const resolvers: Array<AnyResolverMap> = [];

  Object.keys(schema).forEach((fieldName) => {
    const field: VulcanFieldSchema = schema[fieldName]; // TODO: remove the need to call SimpleSchema
    const fieldType = getGraphQLType({
      schema,
      fieldName,
      typeName,
    });
    if (!fieldType) return;
    const inputFieldType = getGraphQLType({
      schema,
      fieldName,
      typeName,
      isInput: true,
    });

    // find types that have a nested schema or have a reference to antoher type
    const isNestedObject = hasNestedSchema(field);
    // note: intl fields are an exception and are not considered as nested
    const isNestedArray =
      hasArrayNestedChild(fieldName, schema) &&
      hasNestedSchema(getArrayChild(fieldName, schema)) &&
      !isIntlField(field) &&
      !isIntlDataField(field);
    const isReferencedObject = hasTypeName(field);
    const arrayChild = getArrayChild(fieldName, schema);
    const isReferencedArray = arrayChild && hasTypeName(arrayChild);
    const hasNesting =
      !isBlackbox(field) &&
      (isNestedArray ||
        isNestedObject ||
        isReferencedObject ||
        isReferencedArray);

    // only include fields that are viewable/insertable/editable and don't contain "$" in their name
    // note: insertable/editable fields must be included in main schema in case they're returned by a mutation
    // OpenCRUD backwards compatibility
    if (
      (hasPermissions(field) || hasLegacyPermissions(field)) &&
      !isArrayChildField(fieldName)
    ) {
      const fieldDescription = field.description;
      const fieldDirective = isIntlField(field) ? "@intl" : "";
      const fieldArguments = isIntlField(field)
        ? [{ name: "locale", type: "String" }]
        : [];

      // if field has a resolveAs or relation, push it to schema
      if (field.resolveAs || field.relation) {
        const {
          fields: resolveAsFields,
          resolvers: resolveAsResolvers,
        } = parseFieldResolvers({
          typeName,
          field: field as ResolveAsField,
          fieldName,
          fieldType,
          fieldDescription,
          fieldDirective,
          fieldArguments,
        });
        resolvers.push(...resolveAsResolvers);
        fields.mainType.push(...resolveAsFields.mainType);
      } else {
        // try to guess GraphQL type
        fields.mainType.push({
          description: fieldDescription,
          name: fieldName,
          args: fieldArguments,
          type: fieldType,
          directive: fieldDirective,
        });
      }

      // Support for enums from allowedValues has been removed (counter-productive)
      // if field has allowedValues, add enum type
      /*if (hasAllowedValues(field)) {
        const allowedValues = getAllowedValues(field);
        // TODO: we can't force value creation
        //if (!isValidEnum(allowedValues)) throw new Error(`Allowed values of field ${ fieldName } can not be used as enum.
        //One or more values are not respecting the Name regex`)
 
        // ignore arrays containing invalid values
        if (isValidEnum(allowedValues)) {
          fields.enums.push({//
            allowedValues,
            typeName: getEnumType(typeName, fieldName)
          });
        } else {
          console.warn(`Warning: Allowed values of field ${fieldName} can not be used as GraphQL Enum. One or more values are not respecting the Name regex.Consider normalizing allowedValues and using separate labels for displaying.`);
        }
      } 
      */

      const mutableDefinitions = parseMutable({
        field,
        fieldName,
        fieldType,
        inputFieldType,
        hasNesting,
      });
      const queriableDefinitions = parseQueriable({
        field,
        fieldName,
        fieldType,
        inputFieldType,
        hasNesting,
      });
      fields.create.push(...mutableDefinitions.create);
      fields.update.push(...mutableDefinitions.update);
      fields.selector.push(...queriableDefinitions.selector);
      fields.selectorUnique.push(...queriableDefinitions.selectorUnique);
      fields.sort.push(...queriableDefinitions.sort);
      fields.readable.push(...queriableDefinitions.readable);
      fields.filterable.push(...queriableDefinitions.filterable);

      // check for nested fields if the field does not reference an existing type
      if (!field.typeName && isNestedObject) {
        // TODO: reuse addTypeAndResolver on the nested schema instead?
        //console.log('detected a nested field', fieldName);
        const nestedSchema = getNestedSchema(field);
        const nestedTypeName = getNestedGraphQLType(typeName, fieldName);
        //const nestedInputTypeName = `${ nestedTypeName }Input`;
        const nestedFields: Partial<NestedFieldsOutput> = parseSchema(
          nestedSchema,
          nestedTypeName
        );
        // add the generated typeName to the info
        nestedFields.typeName = nestedTypeName;
        //nestedFields.inputTypeName = nestedInputTypeName;
        nestedFieldsList.push(nestedFields);
      }
      // check if field is an array of objects if the field does not reference an existing type
      if (isNestedArray && !getArrayChild(fieldName, schema).typeName) {
        // TODO: reuse addTypeAndResolver on the nested schema instead?
        //console.log('detected a field with an array child', fieldName);
        const arrayNestedSchema = getArrayChildSchema(fieldName, schema);
        const arrayNestedTypeName = getNestedGraphQLType(typeName, fieldName);
        const arrayNestedFields: Partial<NestedFieldsOutput> = parseSchema(
          arrayNestedSchema,
          arrayNestedTypeName
        );
        // add the generated typeName to the info
        arrayNestedFields.typeName = arrayNestedTypeName;
        nestedFieldsList.push(arrayNestedFields);
      }
    }
  });
  return {
    fields,
    nestedFieldsList,
    resolvers,
  };
};

export default parseSchema;
