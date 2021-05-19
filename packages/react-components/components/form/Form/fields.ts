/**
 * Field related functions
 */

import { VulcanSchema } from "@vulcanjs/schema";
import { FormProps } from "./Form";
import uniq from "lodash/uniq";
import _ from "underscore";
import { isIntlField } from "@vulcanjs/i18n";

/*

  Get a list of the fields to be included in the current form

  Note: when submitting the form (getData()), do not include any extra fields.

  */
export const getFieldNames = (
  props: FormProps,
  currentDocument,
  optionsFromArgs: {
    excludeHiddenFields?: boolean;
    excludeRemovedFields?: boolean;
    replaceIntlFields?: boolean;
    addExtraFields?: boolean;
    schema?: VulcanSchema;
    mutableFields?: Array<any>;
  } = {}
) => {
  const { fields, addFields, removeFields } = props;
  const defaultOptions = {
    excludeHiddenFields: true,
    excludeRemovedFields: true,
    replaceIntlFields: false,
    addExtraFields: false,
  };
  const options = {
    ...defaultOptions,
    ...optionsFromArgs,
  };
  const {
    schema,
    mutableFields,
    excludeRemovedFields,
    excludeHiddenFields,
    addExtraFields,
    replaceIntlFields,
  } = options;

  // get all editable/insertable fields (depending on current form type)
  let relevantFields = mutableFields;

  // if "fields" prop is specified, restrict list of fields to it
  if (typeof fields !== "undefined" && fields.length > 0) {
    relevantFields = _.intersection(relevantFields, fields);
  }

  // if "hideFields" prop is specified, remove its fields
  if (excludeRemovedFields) {
    // OpenCRUD backwards compatibility
    //const removeFields = removeFields || hideFields;
    if (typeof removeFields !== "undefined" && removeFields.length > 0) {
      relevantFields = _.difference(relevantFields, removeFields);
    }
  }

  // if "addFields" prop is specified, add its fields
  if (
    addExtraFields &&
    typeof addFields !== "undefined" &&
    addFields.length > 0
  ) {
    relevantFields = relevantFields.concat(addFields);
  }

  // remove all hidden fields
  if (excludeHiddenFields) {
    const document = currentDocument;
    relevantFields = _.reject(relevantFields, (fieldName) => {
      const hidden = schema[fieldName].hidden;
      return typeof hidden === "function"
        ? hidden({ props, document })
        : hidden;
    });
  }

  // replace intl fields
  if (replaceIntlFields) {
    relevantFields = relevantFields.map((fieldName) =>
      isIntlField(schema[fieldName]) ? `${fieldName}_intl` : fieldName
    );
  }

  // remove any duplicates
  relevantFields = uniq(relevantFields);

  return relevantFields;
};
