import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import {
  VulcanDocument,
  forEachDocumentField,
  VulcanSchema,
} from "@vulcanjs/schema";
import _forEach from "lodash/forEach";
import { VulcanModel } from "@vulcanjs/model";
import { ContextWithUser } from "./typings";
import { canCreateField, canUpdateField } from "@vulcanjs/permissions";
import { toSimpleSchema, ValidationError } from "@vulcanjs/schema";

interface Modifier {
  $set?: Object;
  $unset?: Object;
}
export const dataToModifier = (data: VulcanDocument): Modifier => ({
  $set: pickBy(data, (f) => f !== null),
  $unset: mapValues(
    pickBy(data, (f) => f === null),
    () => true
  ),
});

export const modifierToData = (modifier: Modifier): VulcanDocument => ({
  ...modifier.$set,
  ...mapValues(modifier.$unset, () => null),
});

/**
 * Validate a document permission recursively
 * @param {*} fullDocument (must not be partial since permission logic may rely on full document)
 * @param {*} documentToValidate document to validate
 * @param {*} schema Simple schema
 * @param {*} context Current user and Users collectionœ
 * @param {*} mode create or update
 * @param {*} currentPath current path for recursive calls (nested, nested[0].foo, ...)
 */
const validateDocumentPermissions = (
  fullDocument: VulcanDocument,
  documentToValidate: VulcanDocument,
  schema: VulcanSchema,
  context: ContextWithUser,
  mode = "create"
  // currentPath = ""
): Array<ValidationError> => {
  let validationErrors: Array<ValidationError> = [];
  const { currentUser } = context;
  forEachDocumentField(
    documentToValidate,
    schema,
    ({ fieldName, fieldSchema, currentPath, isNested }) => {
      if (
        isNested &&
        (!fieldSchema ||
          (mode === "create" ? !fieldSchema.canCreate : !fieldSchema.canUpdate))
      )
        return; // ignore nested without permission
      if (
        !fieldSchema ||
        (mode === "create"
          ? !canCreateField(currentUser, fieldSchema)
          : !canUpdateField(currentUser, fieldSchema, fullDocument))
      ) {
        validationErrors.push({
          id: "errors.disallowed_property_detected",
          properties: {
            name: `${currentPath}${fieldName}`,
          },
        });
      }
    }
  );
  return validationErrors;
};
/*

  If document is not trusted, run validation steps:

  1. Check that the current user has permission to edit each field
  2. Run SimpleSchema validation step

*/
export const validateDocument = (
  document: VulcanDocument,
  model: VulcanModel,
  context: any,
  validationContextName = "defaultContext" // TODO: what is this?
): Array<ValidationError> => {
  const { schema } = model;

  let validationErrors: Array<ValidationError> = [];

  // validate creation permissions (and other Vulcan-specific constraints)
  validationErrors = validationErrors.concat(
    validateDocumentPermissions(document, document, schema, context, "create")
  );
  // build the schema on the fly
  // TODO: does it work with nested schema???
  const simpleSchema = toSimpleSchema(schema);
  // run simple schema validation (will check the actual types, required fields, etc....)
  const validationContext = simpleSchema.namedContext(validationContextName);
  validationContext.validate(document);

  if (!validationContext.isValid()) {
    const errors = (validationContext as any).validationErrors();
    errors.forEach((error) => {
      // eslint-disable-next-line no-console
      // console.log(error);
      if (error.type.includes("intlError")) {
        const intlError = JSON.parse(error.type.replace("intlError|", ""));
        validationErrors = validationErrors.concat(intlError);
      } else {
        validationErrors.push({
          id: `errors.${error.type}`,
          path: error.name,
          properties: {
            modelName: model.name,
            // typeName: collection.options.typeName,
            ...error,
          },
        });
      }
    });
  }

  return validationErrors;
};

/*

  If document is not trusted, run validation steps:

  1. Check that the current user has permission to insert each field
  2. Run SimpleSchema validation step

*/
export const validateModifier = (
  modifier: Modifier,
  document: VulcanDocument,
  model: VulcanModel,
  context,
  validationContextName = "defaultContext"
) => {
  const { schema } = model;
  const set = modifier.$set;
  const unset = modifier.$unset;

  let validationErrors: Array<ValidationError> = [];

  // 1. check that the current user has permission to edit each field
  validationErrors = validationErrors.concat(
    validateDocumentPermissions(document, document, schema, context, "update")
  );

  // 2. run SS validation
  const validationContext = toSimpleSchema(schema).namedContext(
    validationContextName
  );
  validationContext.validate(
    { $set: set, $unset: unset },
    { modifier: true, extendedCustomContext: { documentId: document._id } }
  );

  if (!validationContext.isValid()) {
    const errors = validationContext.validationErrors();
    errors.forEach((error) => {
      // eslint-disable-next-line no-console
      // console.log(error);
      if (error?.type?.includes("intlError")) {
        validationErrors = validationErrors.concat(
          JSON.parse(error.type.replace("intlError|", ""))
        );
      } else {
        validationErrors.push({
          id: `errors.${error.type}`,
          path: error.name,
          properties: {
            modelName: model.name,
            // typeName: collection.options.typeName,
            ...error,
          },
        });
      }
    });
  }

  return validationErrors;
};

export const validateData = (
  data: VulcanDocument,
  model: VulcanModel,
  context
) => {
  return validateModifier(dataToModifier(data), data, model, context);
};
