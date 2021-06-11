type StandardFieldInput =
  | "checkbox"
  | "checkboxgroup"
  | "date"
  | "datetime"
  | "email"
  | "number"
  | "password"
  | "radiogroup"
  | "select"
  | "selectmultiple"
  | "text"
  | "textarea"
  | "time"
  | "url"
  | "text"
  | "password"
  | "number"
  | "statictext";
type AdvancedFieldInput = "likert" | "autocomplete" | "multiautocomplete";
// export type DerivedFieldInput = "nested";
export type VulcanCoreInput = StandardFieldInput | AdvancedFieldInput; // | DerivedFieldInput;
// Accept default component, but also a custom name (user must define this component in the context) or a React component (we avoid a dependency to React here
// by using any)
export type VulcanFieldInput = VulcanCoreInput | string | any; // | DerivedFieldInput;
