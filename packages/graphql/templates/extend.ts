/**
 * extend let's us add new field to a model,
 * based on the configuration of another model
 *
 * Useful for "reversed" relation where one model extends another
 * with new virtual graphql field
 */
export const extendType = ({
  foreignTypeName,
  foreignFieldName,
  typeName,
}: {
  foreignTypeName: string;
  foreignFieldName: string;
  typeName: string;
}) => `
  extend type ${foreignTypeName} {
    ${foreignFieldName}: ${typeName}
  }
  `;
