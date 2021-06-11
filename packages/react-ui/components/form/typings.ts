import { VulcanFieldSchema } from "@vulcanjs/schema";

// Parsed version of the field, easier to display
export interface FormField extends VulcanFieldSchema {
  name: string; // = the field key name  in the schema
  path?: string;
  datatype: any; // ?
  itemDatatype?: any; // TODO: we may reuse the logic from the graphql generator to get the type of a schema field
  intlKeys?: Array<string>;
  document?: any;
  options?: any;
  intlInput?: boolean;
  help?: string;
  layout?: "horizontal" | "vertical";
}

export type FormType = "new" | "edit";
