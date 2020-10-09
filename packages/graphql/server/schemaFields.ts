/**
 * Generate graphQL resolvers
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
} from "@vulcanjs/schema";
import * as relations from "./relationResolvers";
import { getGraphQLType } from "../utils";
import { isIntlField, isIntlDataField } from "../intl";

const capitalize = (word) => {
  if (!word) return word;
  const [first, ...rest] = word;
  return [first.toUpperCase(), ...rest].join("");
};

// get GraphQL type for a nested object (<MainTypeName><FieldName> e.g PostAuthor, EventAdress, etc.)
export const getNestedGraphQLType = (
  typeName: string,
  fieldName: string,
  isInput?: boolean
) =>
  `${typeName}${capitalize(unarrayfyFieldName(fieldName))}${
    isInput ? "Input" : ""
  }`;

//const isObject = field => getFieldTypeName(getFieldType(field));
const hasTypeName = (field) => !!(field || {}).typeName;

const hasNestedSchema = (field) => !!getNestedSchema(field);

const hasArrayChild = (fieldName, schema) => !!getArrayChild(fieldName, schema);

const getArrayChildSchema = (fieldName, schema) => {
  return getNestedSchema(getArrayChild(fieldName, schema));
};
const hasArrayNestedChild = (fieldName, schema) =>
  hasArrayChild(fieldName, schema) && !!getArrayChildSchema(fieldName, schema);

//const getArrayChildTypeName = (fieldName, schema) =>
//  (getArrayChild(fieldName, schema) || {}).typeName;
//const hasArrayReferenceChild = (fieldName, schema) =>
//  hasArrayChild(fieldName, schema) && !!getArrayChildTypeName(fieldName, schema);

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
  resolver?: Function;
  relation?: any;
}
interface ResolveAsRelation extends ResolveAsCommon {}
interface ResolveAsCustom extends ResolveAsCommon {}
type ResolveAs = ResolveAsCustom | ResolveAsRelation;

interface GetResolveAsFieldsInput {
  typeName: string;
  field: { resolveAs: Array<ResolveAs> | ResolveAs };
  fieldName: string;
  fieldType: string;
  fieldDescription: string;
  fieldDirective: any;
  fieldArguments: any;
}
interface GetResolveAsFieldsOutput {
  fields: {
    mainType: Array<{
      description: string;
      name: string;
      args: any;
      type: string;
      direction: any;
    }>;
  };
  resolvers: Array<any>;
}
// Generate GraphQL fields and resolvers for a field with a specific resolveAs
// resolveAs allow to generate "virtual" fields that are queryable in GraphQL but does not exist in the database
export const getResolveAsFields = ({
  typeName,
  field,
  fieldName,
  fieldType,
  fieldDescription,
  fieldDirective,
  fieldArguments,
}: GetResolveAsFieldsInput): GetResolveAsFieldsOutput => {
  const fields = {
    mainType: [],
  };
  const resolvers = [];

  const resolveAsArray = Array.isArray(field.resolveAs)
    ? field.resolveAs
    : [field.resolveAs];

  // check if original (main schema) field should be added to GraphQL schema
  const addOriginalField = shouldAddOriginalField(fieldName, field);
  if (addOriginalField) {
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

    // use specified GraphQL type or else convert schema type
    const fieldGraphQLType = resolveAs.typeName || resolveAs.type || fieldType;

    // if resolveAs is an object, first push its type definition
    // include arguments if there are any
    // note: resolved fields are not internationalized
    fields.mainType.push({
      description: resolveAs.description,
      name: resolverName,
      args: resolveAs.arguments,
      type: fieldGraphQLType,
    });

    // then build actual resolver object and pass it to addGraphQLResolvers
    const resolver = {
      [typeName]: {
        [resolverName]: (document, args, context, info) => {
          const { Users, currentUser } = context;
          // check that current user has permission to access the original non-resolved field
          const canReadField = Users.canReadField(currentUser, field, document);
          const { resolver, relation } = resolveAs;
          if (canReadField) {
            if (resolver) {
              return resolver(document, args, context, info);
            } else if (relation) {
              return relations[relation]({
                document,
                args,
                context,
                info,
                fieldName,
                typeName: fieldGraphQLType,
              });
            }
          } else {
            return null;
          }
        },
      },
    };
    resolvers.push(resolver);
  });
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
interface FieldDefinition {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  args?: any;
  directive?: string;
}
interface FieldDefinitionsMap {
  create: Array<FieldDefinition>;
  update: Array<FieldDefinition>;
  selector: Array<FieldDefinition>;
  selectorUnique: Array<FieldDefinition>;
  sort: Array<FieldDefinition>;
  readable: Array<FieldDefinition>;
  filterable: Array<FieldDefinition>;
}
// handle querying/updating permissions
export const getPermissionFields = ({
  field,
  fieldName,
  fieldType,
  inputFieldType,
  hasNesting = false,
}: GetPermissionFieldsInput): FieldDefinitionsMap => {
  const fields = {
    create: [],
    update: [],
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

interface FullFieldDefinitionsMap extends FieldDefinitionsMap {
  mainType: Array<FieldDefinition>;
  enums: Array<FieldDefinition>;
}
// For nested fields we also need the parent typeName
interface NestedFieldsOutput extends GetSchemaFieldsOutput {
  typeName: string; // the parent typeName for the nested field
}
interface GetSchemaFieldsOutput {
  fields: FullFieldDefinitionsMap;
  nestedFieldsList: Array<NestedFieldsOutput>;
  resolvers: any;
}
// for a given schema, return main type fields, selector fields,
// unique selector fields, sort fields, creatable fields, and updatable fields
export const getSchemaFields = (schema: VulcanSchema, typeName: string) => {
  if (!schema)
    console.log("/////////////////////", typeName, "/////////////////////");
  const fields: FullFieldDefinitionsMap = {
    mainType: [],
    create: [],
    update: [],
    selector: [],
    selectorUnique: [],
    sort: [],
    enums: [],
    readable: [],
    filterable: [],
  };
  const nestedFieldsList = [];
  const resolvers = [];

  Object.keys(schema).forEach((fieldName) => {
    const field = schema[fieldName];
    const fieldType = getGraphQLType({ schema, fieldName, typeName });
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
    const isReferencedArray = hasTypeName(getArrayChild(fieldName, schema));
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

      // if field has a resolveAs, push it to schema
      if (field.resolveAs) {
        const {
          fields: resolveAsFields,
          resolvers: resolveAsResolvers,
        } = getResolveAsFields({
          typeName,
          field,
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
        if (fieldType) {
          fields.mainType.push({
            description: fieldDescription,
            name: fieldName,
            args: fieldArguments,
            type: fieldType,
            directive: fieldDirective,
          });
        }
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

      const permissionsFields = getPermissionFields({
        field,
        fieldName,
        fieldType,
        inputFieldType,
        hasNesting,
      });
      fields.create.push(...permissionsFields.create);
      fields.update.push(...permissionsFields.update);
      fields.selector.push(...permissionsFields.selector);
      fields.selectorUnique.push(...permissionsFields.selectorUnique);
      fields.sort.push(...permissionsFields.sort);
      fields.readable.push(...permissionsFields.readable);
      fields.filterable.push(...permissionsFields.filterable);

      // check for nested fields if the field does not reference an existing type
      if (!field.typeName && isNestedObject) {
        // TODO: reuse addTypeAndResolver on the nested schema instead?
        //console.log('detected a nested field', fieldName);
        const nestedSchema = getNestedSchema(field);
        const nestedTypeName = getNestedGraphQLType(typeName, fieldName);
        //const nestedInputTypeName = `${ nestedTypeName }Input`;
        const nestedFields: Partial<NestedFieldsOutput> = getSchemaFields(
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
        const arrayNestedFields: Partial<NestedFieldsOutput> = getSchemaFields(
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

export default getSchemaFields;
