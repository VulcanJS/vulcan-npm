import { createGraphqlModelServer } from "../../../extendModel.server";
import { normalizeGraphQLSchema } from "../../../testing";
import { parseModel } from "../../parseModel";
import { VulcanGraphqlSchemaServer } from "../../../typings";

const FooModel = (schema: VulcanGraphqlSchemaServer) =>
  createGraphqlModelServer({
    schema,
    name: "Foo",
    graphql: { multiTypeName: "Foos", typeName: "Foo" },
  });

describe("relation", () => {
  describe("hasOne", () => {
    test("generate a type for a field with an hasOne relation", () => {
      const model = FooModel({
        fieldId: {
          type: String,
          canRead: ["admins"],
          relation: {
            fieldName: "field",
            typeName: "Bar",
            kind: "hasOne",
          },
        },
      });
      const res = parseModel(model);
      expect(res.typeDefs).toBeDefined();
      // debug
      //console.log(res.typeDefs);
      const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
      expect(normalizedSchema).toMatch(
        "type Foo { fieldId: String field: Bar }"
      );
    });
  });
});
