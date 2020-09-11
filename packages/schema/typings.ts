/**
 * A Vulcan Schema as a JSON object
 *
 * /*\ this is not the simpl-schema process version
 */
import { SchemaDefinition } from "simpl-schema";
type VulcanSchemaDefinition<T> = SchemaDefinition<T> & {
  // TODO: all Vulcan specific fields goes here
};
export type VulcanSchema = {
  [key: string]: VulcanSchemaDefinition<any>;
};
