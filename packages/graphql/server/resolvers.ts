import { VulcanSchema } from "@vulcanjs/schema";
import { ResolverMap } from "./typings";
import { canReadField } from "../permissions";

/**
 * Generate field resolvers for the type defined in the SimpleSchema.
 *
 *
 * @param {SimpleSchema} schema
 * @returns an object mapping the field names to a GraphQL resolver function
 */
const generateResolversFromSchema = (schema: VulcanSchema): ResolverMap => {
  const firstLevelSchemaKeys = Object.keys(schema);
  const resolvers = {};

  firstLevelSchemaKeys.forEach((fieldName) => {
    const field = schema[fieldName];
    // only add resolvers for the fields that can be read
    if (field && field.canRead) {
      const resolver = (root, args, context) => {
        const result = root[fieldName];
        if (typeof result === "undefined") return null;
        const { currentUser, Users } = context;
        if (canReadField(currentUser, field, root)) {
          return result;
        } else {
          return null;
        }
      };
      resolvers[fieldName] = resolver;
    }
  });
  return resolvers;
};

export default generateResolversFromSchema;
