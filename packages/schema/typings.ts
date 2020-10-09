/**
 * A Vulcan Schema as a JSON object
 *
 * /*\ this is not the simpl-schema processed version, but the definition
 */
import { SchemaDefinition, EvaluatedSchemaDefinition } from "simpl-schema";

type PermissionDefinition = String | Function;
interface VulcanField {
  canRead?: PermissionDefinition | Array<PermissionDefinition>;
  canCreate?: PermissionDefinition | Array<PermissionDefinition>;
  canUpdate?: PermissionDefinition | Array<PermissionDefinition>;
  // viewableBy, Deprecated, do not exist anymore in Vulcan
  // insertableBy,
  // editableBy,
  // Field-level resolver
  resolveAs?: any;
  // TODO: review those fields
  // Field is hidden in forms
  hidden?: boolean;
  // "mustComplete", // mustComplete: true means the field is required to have a complete profile
  form?: any; // extra form properties
  inputProperties?: any; // extra form properties
  itemProperties?: any; // extra properties for the form row
  input?: any; // SmartForm control (String or React component)
  control?: any; // SmartForm control (String or React component) (legacy)
  order?: any; // position in the form
  group?: any; // form fieldset group
  arrayItem?: any; // properties for array items

  onCreate?: Function; // field insert callback, called server-side
  onUpdate?: Function; // field edit callback, called server-side
  onDelete?: Function; // field remove callback, called server-side

  typeName?: string; // the GraphQL type to resolve the field with
  searchable?: boolean; // whether a field is searchable
  description?: string; // description/help
  beforeComponent?: any; // before form component
  afterComponent?: any; // after form component
  placeholder?: any; // form field placeholder value
  options?: any; // form options
  query?: string; // field-specific data loading query
  autocompleteQuery?: string; // query used to populate autocomplete
  selectable?: boolean; // field can be used as part of a selector when querying for data
  unique?: boolean; // field can be used as part of a selectorUnique when querying for data
  orderable?: boolean; // field can be used to order results when querying for data (backwards-compatibility)
  sortable?: boolean; // field can be used to order results when querying for data

  apiOnly?: boolean; // field should not be inserted in database
  relation?: any; // define a relation to another model

  intl?: boolean; // set to `true` to make a field international
  isIntlData?: boolean; // marker for the actual schema fields that hold intl strings
  intlId?: boolean; // set an explicit i18n key for a field
}
export interface VulcanFieldSchema<T = any>
  extends VulcanField,
    SchemaDefinition<T> {}

export type VulcanSchema = {
  [key: string]: VulcanFieldSchema;
};

/**
 * Version obtained after running new SimpleSchema({...})._schema
 */
export interface VulcanFieldSchemaEvaluated<T = any>
  extends EvaluatedSchemaDefinition,
    VulcanField {}
export type VulcanSchemaEvaluated = {
  [key: string]: VulcanFieldSchemaEvaluated;
};

export interface VulcanDocument {
  // Special fields
  _id?: string;
  userId?: string;
  slug?: string;
  [key: string]: any;
}
