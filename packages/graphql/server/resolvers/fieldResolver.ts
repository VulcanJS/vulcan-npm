/**
 * Build resolver for a field, based on resolveAs or relation
 */
import { VulcanFieldSchema } from "@vulcanjs/schema";
import { QueryResolver } from "../typings";
import { canReadField } from "@vulcanjs/permissions";
/**
 * Check that the field is readable and call the custom resolver if it is
 * @param resolver
 */
export const withFieldPermissionCheckResolver = (
  field: VulcanFieldSchema,
  resolver: QueryResolver
): QueryResolver => (document, args, context, info) => {
  const { currentUser } = context;
  // check that current user has permission to access the original non-resolved field
  const userCanReadField = canReadField(currentUser, field, document);
  if (!userCanReadField) return Promise.resolve(null);
  return resolver(document, args, context, info);
};
