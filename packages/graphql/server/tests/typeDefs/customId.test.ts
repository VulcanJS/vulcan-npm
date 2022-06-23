/**
 * When using a scalar for the _id
 */
import { createGraphqlModelServer } from "../../../extendModel.server";
import { normalizeGraphQLSchema } from "../../../testing";
import { parseModel } from "../../parseModel";
import { VulcanGraphqlSchemaServer } from "../../typings";

const FooModel = (schema: VulcanGraphqlSchemaServer) =>
  createGraphqlModelServer({
    schema,
    name: "Foo",
    graphql: { multiTypeName: "Foos", typeName: "Foo" },
    permissions: {
      canRead: ["anyone"],
      canCreate: ["anyone"],
      canUpdate: ["anyone"],
      canDelete: ["anyone"],
    },
  });

test("use typeName where relevant", () => {
  const model = FooModel({
    _id: {
      type: String,
      typeName: "ID",
      canRead: ["anyone"],
      canCreate: ["anyone"],
      canUpdate: ["anyone"],
      canDelete: ["anyone"],
    },
    fieldId: {
      type: String,
      typeName: "ID",
      canRead: ["admins"],
      canCreate: ["anyone"],
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
  // NOTE: we expect user to define the ID scalar in their schema
  expect(normalizedSchema).toMatch(
    "type Foo { _id: ID fieldId: ID field: Bar }"
  );
  expect(normalizedSchema).toMatch("input FooSelectorUniqueInput { _id: ID }");
  expect(normalizedSchema).toMatch(
    /input SingleFooInput \{ (.*) id: ID (.*) \}/
  );
  expect(normalizedSchema).toMatch(
    /input UpdateFooInput \{ (.*) id: ID (.*) \}/
  );
  expect(normalizedSchema).toMatch(
    /input DeleteFooInput \{ (.*) id: ID (.*) \}/
  );
  expect(normalizedSchema).toMatch(
    /input CreateFooInput \{ (.*) id: ID (.*) \}/
  );
  // NOTE: we expect user to define the ID_Selector type in their schema
  // The Selector will only be generated if the underlying Vulcan type is actually filterable (a String, Float, Number, Date etc.)
  // = if the graphql scalar translate to a filterable type
  expect(normalizedSchema).toMatch(
    /input FooFilterInput \{ (.*) _id: ID_Selector (.*) \}/
  );
});
