import { createGraphqlModel } from "@vulcanjs/graphql";
import { print } from "graphql/language/printer";

import getFormFragments from "../modules/formFragments";
const test = it;

// allow to easily test regex on a graphql string
// all blanks and series of blanks are replaces by one single space
const normalizeFragment = (gqlSchema) =>
  print(gqlSchema).replace(/\s+/g, " ").trim();

const defaultArgs = {
  formType: "new" as const,
};
const makeModel = (schema) =>
  createGraphqlModel({
    name: "Foo",
    schema,
    graphql: {
      typeName: "Foo",
      multiTypeName: "Foos",
    },
  });

import { disableFragmentWarnings } from "graphql-tag";
beforeEach(() => {
  // @see https://github.com/apollographql/graphql-tag#warnings
  // Let you define the same fragment twice in tests
  disableFragmentWarnings();
});
describe("vulcan:form/formFragments", function () {
  test("generate valid query and mutation fragment", () => {
    const schema = {
      field: {
        type: String,
        canRead: ["admins"],
        canCreate: ["admins"],
      },
      nonCreateableField: {
        type: String,
        canRead: ["admins"],
        canUpdate: ["admins"],
      },
    };
    const model = makeModel(schema);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      model,
    });
    expect(queryFragment).toBeDefined();
    expect(mutationFragment).toBeDefined();
    expect(normalizeFragment(queryFragment)).toMatch(
      "fragment FoosNewFormQueryFragment on Foo { field }"
    );
    expect(normalizeFragment(mutationFragment)).toMatch(
      "fragment FoosNewFormMutationFragment on Foo { field nonCreateableField }"
    );
  });
  test("take formType into account", function () {
    const schema = {
      field: {
        type: String,
        canRead: ["admins"],
        canUpdate: ["admins"],
      },
      // should not appear
      nonUpdateableField: {
        type: String,
        canRead: ["admins"],
        canCreate: ["admins"],
      },
    };
    const model = makeModel(schema);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      formType: "edit",
      model,
    });
    expect(normalizeFragment(queryFragment)).toMatch(
      "fragment FoosEditFormQueryFragment on Foo { field }"
    );
    expect(normalizeFragment(mutationFragment)).toMatch(
      "fragment FoosEditFormMutationFragment on Foo { field nonUpdateableField }"
    );
  });
  test("create subfields for nested objects", () => {
    const schema = {
      nestedField: {
        canCreate: ["admins"],
        type: {
          firstNestedField: {
            canCreate: ["admins"],
            type: String,
          },
          secondNestedField: {
            canCreate: ["admins"],
            type: Number,
          },
        },
      },
    };
    const model = makeModel(schema);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      model,
    });
    expect(normalizeFragment(queryFragment)).toMatch(
      "fragment FoosNewFormQueryFragment on Foo { nestedField { firstNestedField secondNestedField } }"
    );
    expect(normalizeFragment(mutationFragment)).toMatch(
      "fragment FoosNewFormMutationFragment on Foo { nestedField { firstNestedField secondNestedField } }"
    );
  });
  test("create subfields for arrays of nested objects", () => {
    const schema = {
      arrayField: {
        type: Array,
        canRead: ["admins"],
        canCreate: ["admins"],
      },
      "arrayField.$": {
        canCreate: ["admins"],
        type: {
          firstNestedField: {
            canCreate: ["admins"],
            type: String,
          },
          secondNestedField: {
            canCreate: ["admins"],
            type: Number,
          },
        },
      },
    };
    const model = makeModel(schema);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      model,
    });
    expect(normalizeFragment(queryFragment)).toMatch(
      "fragment FoosNewFormQueryFragment on Foo { arrayField { firstNestedField secondNestedField } }"
    );
    expect(normalizeFragment(mutationFragment)).toMatch(
      "fragment FoosNewFormMutationFragment on Foo { arrayField { firstNestedField secondNestedField } }"
    );
  });
  test("add readable fields to mutation fragment", () => {
    const schema = {
      field: {
        type: String,
        canRead: ["admins"],
        canCreate: ["admins"],
      },
      readOnlyField: {
        type: String,
        canRead: ["admins"],
      },
    };
    const model = makeModel(schema);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      model,
    });
    expect(normalizeFragment(queryFragment)).not.toMatch("readOnlyField"); // this does not affect the queryFragment;
    expect(normalizeFragment(mutationFragment)).toMatch(
      "fragment FoosNewFormMutationFragment on Foo { field readOnlyField }"
    );
  });
  test("ignore virtual/resolved fields", () => {
    const schema = {
      field: {
        type: String,
        canRead: ["admins"],
        canCreate: ["admins"],
        resolveAs: {
          fieldName: "resolvedField",
          type: "Whatever",
          addOriginalField: true,
          resolver: () => ({}),
        },
      },
      virtual: {
        type: String,
        canRead: ["admins"],
        resolveAs: {
          type: "Whatever",
          resolver: () => ({}),
        },
      },
    };
    const model = makeModel(schema);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      model,
    });
    expect(normalizeFragment(queryFragment)).not.toMatch("virtual");
    expect(normalizeFragment(mutationFragment)).toMatch(
      "fragment FoosNewFormMutationFragment on Foo { field }"
    );
  });
  test("add userId and _id when they are present in the schema", () => {
    const schemaWithIds = {
      _id: {
        type: String,
        canRead: ["guests"],
      },
      userId: {
        type: String,
        canRead: ["guests"],
      },
    };
    const model = makeModel(schemaWithIds);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      model,
    });
    expect(normalizeFragment(queryFragment)).toMatch(/_id/);
    expect(normalizeFragment(mutationFragment)).toMatch(/_id/);
    expect(normalizeFragment(queryFragment)).toMatch(/userId/);
    expect(normalizeFragment(mutationFragment)).toMatch(/userId/);
  });
  test("do not add _id and userId if not in the schema", () => {
    const schemaWithoutIds = {
      field: {
        type: String,
        canRead: ["guests"],
        canCreate: ["guests"],
      },
    };
    const model = makeModel(schemaWithoutIds);
    const { queryFragment, mutationFragment } = getFormFragments({
      ...defaultArgs,
      model,
    });
    expect(normalizeFragment(queryFragment)).not.toMatch(/_id/);
    expect(normalizeFragment(mutationFragment)).not.toMatch(/_id/);
    expect(normalizeFragment(queryFragment)).not.toMatch(/userId/);
    expect(normalizeFragment(mutationFragment)).not.toMatch(/userId/);
  });
});
