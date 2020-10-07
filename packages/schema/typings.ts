/**
 * A Vulcan Schema as a JSON object
 *
 * /*\ this is not the simpl-schema processed version, but the definition
 */
import { SchemaDefinition } from "simpl-schema";

type VulcanSchemaDefinition<T> = SchemaDefinition<T> & {
  // TODO: all Vulcan specific fields goes here
  canRead?: Array<String | Function>;
  canCreate?: Array<String | Function>;
  canUpdate?: Array<String | Function>;
  // viewableBy, Deprecated, do not exist anymore in Vulcan
  // insertableBy,
  // editableBy,
  selectable?: any;
  unique?: boolean;
  apiOnly?: boolean;
};

export interface VulcanDocument {
  // Special fields
  _id?: string;
  userId?: string;
  slug?: string;
  [key: string]: any;
}
export type VulcanFieldSchema<T = any> = VulcanSchemaDefinition<T>;
export type VulcanSchema = {
  [key: string]: VulcanFieldSchema;
};
