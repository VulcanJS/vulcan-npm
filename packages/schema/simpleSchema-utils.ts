/**
 * Helpers specific to Simple Schema
 * See "schema_utils" for more generic methods
 */

import { VulcanSchema, VulcanFieldSchema, FieldTypeName } from "./typings";

// remove ".$" at the end of array child fieldName
export const unarrayfyFieldName = (fieldName) => {
  return fieldName ? fieldName.split(".")[0] : fieldName;
};

// allowed values of a field if present
export const getAllowedValues = (field) =>
  field.type.definitions[0].allowedValues;
export const hasAllowedValues = (field) => {
  const allowedValues = getAllowedValues(field);
  if (allowedValues && !allowedValues.length) {
    console.warn(`Field ${field} as empty allowed values`);
    return false;
  }
  return !!allowedValues;
};

export const isArrayChildField = (fieldName) => fieldName.indexOf("$") !== -1;

const isJSON = (field: VulcanFieldSchema) =>
  field.typeName === "JSON" ||
  getFieldTypeName(getFieldType(field)) === "JSON" ||
  (getFieldTypeName(getFieldType(field)) === "Object" && field.blackbox);
export const hasNestedSchema = (field: VulcanFieldSchema) =>
  getFieldTypeName(getFieldType(field)) === "Object" && !isJSON(field);

export const isBlackbox = (field: VulcanFieldSchema): boolean =>
  !!field.blackbox;
//export const isBlackbox = (fieldName, schema) => {
//    const field = schema[fieldName];
//    // for array field, check parent recursively to find a blackbox
//    if (isArrayChildField(fieldName)) {
//        const parentField = schema[fieldName.slice(0, -2)];
//        return isBlackbox(parentField);
//    }
//    return field.type.definitions[0].blackbox;
//};

// TODO: it would be easier to compute it from a normal schema definition instead of the evaluated version
export const getFieldType = (
  field: VulcanFieldSchema
): VulcanFieldSchema["type"] => field.type;

export const getFieldTypeName = (
  fieldType: VulcanFieldSchema["type"]
): FieldTypeName => {
  if (fieldType === Object) {
    // explicitely a blackbox JSON
    return "JSON";
  } else if (typeof fieldType === "object") {
    // a nested schema
    return "Object";
  } else if (typeof fieldType === "function") {
    // a constructor like String, number etc.
    return (fieldType as any).name;
  }
  return fieldType;
};

export const getArrayChild = (fieldName, schema) => schema[`${fieldName}.$`];

export const getNestedSchema = (
  field: VulcanFieldSchema // TODO: we should be able to have a generic on this type to tell that the input should be a field with a nested schema
): VulcanSchema => field.type as VulcanSchema;
