/**
 * TODO: handle this in @vulcanjs/graphql package instead? Or /permissions
 */
import { VulcanDocument } from "@vulcanjs/schema";

export type GroupName =
  /** Literally anyone, logged in or not */
  | "anyone"
  /** @deprecated Prefer non-ambigous group "anyone", as guests could mean anyone OR only non-logged users (excluding "members") */
  | "guests"
  /**
   * Not logged in users (excluding members)
   */
  | "visitors"
  /** Logged in users */
  | "members"
  /** User whose _id matches the document userId special field */
  | "owners"
  /** Users with isAdmin set to true */
  | "admins"
  | string;
export interface VulcanUser extends VulcanDocument {
  // minimal fields for the User model
  groups: Array<GroupName>;
  isAdmin?: boolean;
  _id?: string;
}
