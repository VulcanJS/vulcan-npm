import get from "lodash/get.js";
import { VulcanGraphqlFieldSchema } from "../typings";

export const makeCheckboxgroup = (
  // FIXME: leads to weird typing issue with simple schema
  field: Partial</*VulcanGraphqlFieldSchema*/ any> = {}
) => {
  const hasOther = !!get(field, "itemProperties.showOther");

  if (!field.options) {
    throw new Error(`Checkboxgroup fields need an 'options' property`);
  }

  // add additional field object properties
  const cbgField: any = {
    ...field,
    type: Array,
    input: "checkboxgroup",
  };

  // if field doesn't allow "other" responses, limit it to whitelist of allowed values
  if (!hasOther) {
    cbgField.arrayItem = {
      ...cbgField.arrayItem,
      allowedValues: field.options.map(({ value }) => value),
    };
  }

  return cbgField;
};
