import { createGraphqlModelServer } from "../../../extendModel.server";
import { normalizeGraphQLSchema } from "../../../testing";
import { parseModel } from "../../parseModel";
import { VulcanGraphqlSchemaServer } from "../../typings";

const makeFooModel = (schema: VulcanGraphqlSchemaServer) =>
  createGraphqlModelServer({
    schema,
    name: "Foo",
    graphql: { multiTypeName: "Foos", typeName: "Foo" },
  });

test("generate a type for a field with resolveAs and custom resolver", () => {
  const model = makeFooModel({
    field: {
      type: String,
      canRead: ["admins"],
      resolveAs: {
        fieldName: "field",
        type: "Bar",
        resolver: async (document, args, { Users }) => {
          return "bar";
        },
      },
    },
  });
  const res = parseModel(model);
  expect(res.typeDefs).toBeDefined();
  // debug
  //console.log(res.typeDefs);
  const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
  expect(normalizedSchema).toMatch("type Foo { field: Bar }");
});
test("generate a type for a resolved field with addOriginalField=true", () => {
  const model = makeFooModel({
    field: {
      type: String,
      optional: true,
      canRead: ["admins"],
      resolveAs: {
        fieldName: "resolvedField",
        type: "Bar",
        resolver: async (document, args, context) => {
          return "bar";
        },
        addOriginalField: true,
      },
    },
  });
  const res = parseModel(model);
  expect(res.typeDefs).toBeDefined();
  const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
  expect(normalizedSchema).toMatch(
    "type Foo { field: String resolvedField: Bar }"
  );
});
test("generate a type for a field with addOriginalField=true for at least one resolver of an array of resolveAs", () => {
  const model = makeFooModel({
    field: {
      type: String,
      optional: true,
      canRead: ["admins"],
      resolveAs: [
        {
          fieldName: "resolvedField",
          type: "Bar",
          resolver: async () => "bar",
          addOriginalField: true,
        },
        {
          fieldName: "anotherResolvedField",
          type: "Bar",
          resolver: async () => "bar",
        },
      ],
    },
  });
  const res = parseModel(model);
  expect(res.typeDefs).toBeDefined();
  const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
  expect(normalizedSchema).toMatch(
    "type Foo { field: String resolvedField: Bar anotherResolvedField: Bar }"
  );
});
test("generate a field resolve type with arguments, directives and description", () => {
  const model = makeFooModel({
    field: {
      type: String,
      optional: true,
      canRead: ["admins"],
      resolveAs: {
        fieldName: "resolvedField",
        type: "Bar",
        resolver: async () => `Hello`,
        arguments: "variable: string",
        description: "Some field",
        typeName: "ResolvedType",
        addOriginalField: true,
      },
    },
  });
  const res = parseModel(model);
  expect(res.typeDefs).toBeDefined();
  const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
  expect(normalizedSchema).toMatch(
    "type Foo { field: String # Some field resolvedField(variable: string): ResolvedType }"
  );
});
