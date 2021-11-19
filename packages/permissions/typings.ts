/**
 * TODO: handle this in @vulcanjs/graphql package instead? Or /permissions
 */
import { VulcanDocument } from "@vulcanjs/schema";

export type GroupName =
  | "anyone"
  | "guests"
  | "members"
  | "owners"
  | "admins"
  | string;
export interface VulcanUser extends VulcanDocument {
  // minimal fields for the User model
  groups: Array<GroupName>;
  isAdmin?: boolean;
  _id?: string;
}
