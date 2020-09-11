/**
 * Generates the default fragment for a collection
 * = a fragment containing all fields
 */
import { getFragmentFieldNames, isBlackbox } from "@vulcan/schema";
import { VulcanModel } from "@vulcan/model";
import { VulcanSchema } from "@vulcan/schema";

const intlSuffix = "_intl";

interface getObjectFragmentArgs {
  schema: VulcanSchema;
  fragmentName: string;
  options: any;
}
// get fragment for a whole object (root schema or nested schema of an object or an array)
const getObjectFragment = ({
  schema,
  fragmentName,
  options,
}: getObjectFragmentArgs): string | null => {
  const fieldNames = getFragmentFieldNames({ schema, options });
  const childFragments =
    fieldNames.length &&
    fieldNames
      .map((fieldName) =>
        getFieldFragment({
          schema,
          fieldName,
          options,
          getObjectFragment: getObjectFragment,
        })
      )
      // remove empty values
      .filter((f) => !!f);
  if (childFragments.length) {
    return `${fragmentName} { ${childFragments.join("\n")} }`;
  }
  return null;
};

// get fragment for a specific field (either the field name or a nested fragment)
export const getFieldFragment = ({
  schema,
  fieldName,
  options,
  getObjectFragment: getObjectFragmentArg = getObjectFragment, // a callback to call on nested schema
}) => {
  // intl
  if (fieldName.slice(-5) === intlSuffix) {
    return `${fieldName}{ locale value }`;
  }
  if (fieldName === "_id") return fieldName;
  const field = schema[fieldName];

  const fieldType = field.type.singleType;
  const fieldTypeName =
    typeof fieldType === "object"
      ? "Object"
      : typeof fieldType === "function"
      ? fieldType.name
      : fieldType;

  switch (fieldTypeName) {
    case "Object":
      if (!isBlackbox(field) && fieldType._schema) {
        return (
          getObjectFragmentArg({
            fragmentName: fieldName,
            schema: fieldType._schema,
            options,
          }) || null
        );
      }
      return fieldName;
    case "Array":
      const arrayItemFieldName = `${fieldName}.$`;
      const arrayItemField = schema[arrayItemFieldName];
      // note: make sure field has an associated array item field
      if (arrayItemField) {
        // child will either be native value or a an object (first case)
        const arrayItemFieldType = arrayItemField.type.singleType;
        if (!isBlackbox(field) && arrayItemFieldType._schema) {
          return (
            getObjectFragmentArg({
              fragmentName: fieldName,
              schema: arrayItemFieldType._schema,
              options,
            }) || null
          );
        }
      }
      return fieldName;
    default:
      return fieldName; // fragment = fieldName
  }
};

export const getDefaultFragmentName = (model: ModelSkeleton): string =>
  `${model.graphql.typeName}DefaultFragment`;
/*

Create default "dumb" gql fragment object for a given collection

*/
interface ModelSkeleton {
  schema: VulcanModel["schema"];
  graphql: Pick<VulcanModel["graphql"], "typeName">;
}
export const getDefaultFragmentText = (
  model: ModelSkeleton, // only need a partially defined model
  options = { onlyViewable: true }
) => {
  const schema = model.schema;
  return (
    getObjectFragment({
      schema,
      fragmentName: `fragment ${getDefaultFragmentName(model)} on ${
        model.graphql.typeName
      }`,
      options,
    }) || null
  );
};

export default getDefaultFragmentText;
