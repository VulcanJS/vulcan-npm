import SimpleSchema from "simpl-schema";
SimpleSchema.extendOptions([
  "hidden", // hidden: true means the field is never shown in a form no matter what
  "mustComplete", // mustComplete: true means the field is required to have a complete profile
  "form", // extra form properties
  "inputProperties", // extra form properties
  "itemProperties", // extra properties for the form row
  "input", // SmartForm control (String or React component)
  "control", // SmartForm control (String or React component) (legacy)
  "order", // position in the form
  "group", // form fieldset group
  "arrayItem", // properties for array items

  "onCreate", // field insert callback
  "onUpdate", // field edit callback
  "onDelete", // field remove callback

  "canRead", // who can view the field
  "canCreate", // who can insert the field
  "canUpdate", // who can edit the field

  "typeName", // the type to resolve the field with
  "resolveAs", // field-level resolver
  "searchable", // whether a field is searchable
  "description", // description/help
  "beforeComponent", // before form component
  "afterComponent", // after form component
  "placeholder", // form field placeholder value
  "options", // form options
  "query", // field-specific data loading query
  "autocompleteQuery", // query used to populate autocomplete
  "selectable", // field can be used as part of a selector when querying for data
  "unique", // field can be used as part of a selectorUnique when querying for data
  "orderable", // field can be used to order results when querying for data (backwards-compatibility)
  "sortable", // field can be used to order results when querying for data

  "apiOnly", // field should not be inserted in database
  "relation", // define a relation to another model

  "intl", // set to `true` to make a field international
  "isIntlData", // marker for the actual schema fields that hold intl strings
  "intlId", // set an explicit i18n key for a field
]);
