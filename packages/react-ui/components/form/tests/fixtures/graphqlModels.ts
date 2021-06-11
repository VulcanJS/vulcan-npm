import { createGraphqlModel } from "@vulcanjs/graphql";

// dummy simplified model
export interface OneFieldType {
  text: string;
  __typename?: "OneField"; // don't forget the typeName in mocks
}
export const OneFieldGraphql = createGraphqlModel({
  name: "OneField",
  schema: {
    text: {
      type: String,
      canRead: ["anyone"],
      canUpdate: ["anyone"],
      canCreate: ["anyone"],
    },
  },
  graphql: {
    typeName: "OneField",
    multiTypeName: "OneFields",
  },
});
