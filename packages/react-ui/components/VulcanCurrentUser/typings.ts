/**
 * TODO: handle this in @vulcanjs/graphql package instead? Or /permissions
 */
import { VulcanDocument } from "@vulcanjs/schema";

export interface VulcanUser extends VulcanDocument {
  // minimal fields for the User model
  groups: Array<string>;
}
