import { createModel } from "@vulcanjs/model";

import expect from "expect";

import SimpleSchema from "simpl-schema";
import extendModel, { createGraphqlModel } from "../../extendModel";
import { VulcanGraphqlModel } from "../../typings";
import { normalizeGraphQLSchema } from "../../testUtils";
import { getDefaultFragmentText } from "../defaultFragment";
const test = it;

const FooModel = (schema): VulcanGraphqlModel =>
  createGraphqlModel({
    schema,
    name: "Foo",
    graphql: { multiTypeName: "Foos", typeName: "Foo" },
  });

// NOTE: we consider that the "extendModel" function triggers the default fragment generation
// We could also manually call "getDefaultFragmentText" on the model
describe("default fragment generation", () => {
  test("generate default fragment for basic collection", () => {
    const model = FooModel({
      foo: {
        type: String,
        canRead: ["guests"],
      },
      bar: {
        type: String,
        canRead: ["guests"],
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { foo bar }"
    );
  });
  test("generate default fragment with nested object", () => {
    const model = FooModel({
      foo: {
        type: String,
        canRead: ["guests"],
      },
      nestedField: {
        canRead: ["guests"],
        type: {
          bar: {
            type: String,
            canRead: ["guests"],
          },
        },
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { foo nestedField { bar } }"
    );
  });
  test("generate default fragment with blackbox JSON object (no nesting)", () => {
    const model = FooModel({
      foo: {
        type: String,
        canRead: ["guests"],
      },
      object: {
        canRead: ["guests"],
        type: Object,
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { foo object }"
    );
  });
  test("generate default fragment with nested array of objects", () => {
    const model = FooModel({
      arrayField: {
        type: Array,
        canRead: ["admins"],
      },
      "arrayField.$": {
        type: {
          subField: {
            type: String,
            canRead: ["admins"],
          },
        },
        canRead: ["admins"],
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { arrayField { subField } }"
    );
  });
  test("generate default fragment with array of native values", () => {
    const model = FooModel({
      arrayField: {
        type: Array,
        canRead: ["admins"],
      },
      "arrayField.$": {
        type: Number,
        canRead: ["admins"],
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { arrayField }"
    );
  });
  test("return fieldName for intl fields even if they are objects or arrays", () => {
    const model = FooModel({
      foo_intl: {
        type: Array,
        canRead: ["guests"],
      },
      "foo_intl.$": {
        type: String,
        canRead: ["guests"],
      },
      bar_intl: {
        type: Object,
        canRead: ["guests"],
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { foo_intl{ locale value } bar_intl{ locale value } }"
    );
  });

  test("do not generate subfield for blackboxed array", () => {
    const model = FooModel({
      foo: {
        type: Array,
        canRead: ["guests"],
        blackbox: true,
      },
      "foo.$": {
        type: {
          bar: {
            type: String,
            canRead: ["guests"],
          },
        },
        blackbox: true,
        canRead: ["guests"],
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { foo }"
    );
  });

  describe("resolveAs", () => {
    test("ignore resolved fields with a an unknown type", () => {
      const model = FooModel({
        // ignored in default fragments because we don't know People type
        object: {
          type: Object,
          canRead: ["admins"],
          resolveAs: {
            fieldName: "resolvedObject",
            type: "People",
            resolver: () => null,
          },
        },
        // dummy field to avoid empty fragment
        foo: {
          type: String,
          canRead: ["admins"],
        },
      });
      const fragment = getDefaultFragmentText(model);
      const normalizedFragment = normalizeGraphQLSchema(fragment);
      expect(normalizedFragment).toMatch(
        "fragment FooDefaultFragment on Foo { object foo }"
      );
    });
    test("add original field with resolveAs as a default", () => {
      const model = FooModel({
        json: {
          type: Object,
          canRead: ["admins"],
          resolveAs: {
            fieldName: "resolvedJSON",
            type: "JSON",
            resolver: () => null,
          },
        },
      });
      const fragment = getDefaultFragmentText(model);
      const normalizedFragment = normalizeGraphQLSchema(fragment);
      expect(normalizedFragment).toMatch(
        "fragment FooDefaultFragment on Foo { json }"
      );
    });
    test("do not add original field if at least one addOriginalField is false", () => {
      const model = FooModel({
        // ignored in default fragments
        foo: {
          type: String,
          canRead: ["admins"],
          resolveAs: [
            {
              fieldName: "resolvedObject",
              type: "String",
              resolver: () => null,
            },
            {
              fieldName: "anotherResolvedObject",
              type: "String",
              resolver: () => null,
              addOriginalField: false,
            },
          ],
        },
      });
      const fragment = getDefaultFragmentText(model);
      expect(fragment).toBeNull(); // resolved field are not yet present in the fragment so it's null
      //const normalizedFragment = normalizeGraphQLSchema(fragment);
      //expect(normalizedFragment).toMatch('fragment FoosDefaultFragment on Foo { resolvedObject anotherResolvedObject }');
    });
  });
  test("ignore referenced schemas", () => {
    const model = FooModel({
      field: {
        type: String,
        canRead: ["admins"],
      },
      // ignored in default fragments
      address: {
        type: Object,
        typeName: "Address",
        canRead: ["admins"],
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { field }"
    );
  });
  test("ignore referenced schemas in array child", () => {
    const model = FooModel({
      field: {
        type: String,
        canRead: ["admins"],
      },
      emails: {
        type: Array,
        optional: true,
        canRead: ["admin"],
      },
      "emails.$": {
        type: Object,
        typeName: "UserEmail",
        optional: true,
      },
    });
    const fragment = getDefaultFragmentText(model);
    const normalizedFragment = normalizeGraphQLSchema(fragment);
    expect(normalizedFragment).toMatch(
      "fragment FooDefaultFragment on Foo { field }"
    );
  });
});
