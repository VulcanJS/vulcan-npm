import get from "lodash/get.js";

export const makeRadiogroup = (field: any = {}) => {
  const hasOther = !!get(field, "itemProperties.showOther");

  if (!field.options) {
    throw new Error(`Radiogroup fields need an 'options' property`);
  }

  const rgField: any = {
    ...field,
    type: Array,
    input: "radiogroup",
  };

  // if field doesn't allow "other" responses, limit it to whitelist of allowed values
  if (!hasOther) {
    rgField.arrayItem = {
      ...rgField.arrayItem,
      allowedValues: field.options.map(({ value }) => value),
    };
  }

  return rgField;
};
