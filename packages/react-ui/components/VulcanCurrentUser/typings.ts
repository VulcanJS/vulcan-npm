/**
 * TODO: handle this in @vulcanjs/graphql package instead?
 */
import { VulcanDocument } from "@vulcanjs/schema";

export interface VulcanUser extends VulcanDocument {
  // minimal fields for the User model
  roles: Array<string>;
}
