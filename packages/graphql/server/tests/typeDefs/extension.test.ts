import { createGraphqlModelServer } from "../../../extendModel.server";
import { normalizeGraphQLSchema } from "../../../testing";
import { parseAllModels } from "../../parseAllModels";
import { VulcanGraphqlSchemaServer } from "../../typings";

/**
 * Foo knows nothing about Bar!
 * But Bar should be able to extend Foo graphql schema with a
 * "virtual" field, a relation that can be resolved with a "find"
 */
const FooModel = createGraphqlModelServer({
  schema: {
    _id: {
      type: String,
    },
    foo: {
      type: String,
    },
  } as VulcanGraphqlSchemaServer,
  name: "Foo",
  graphql: { multiTypeName: "Foos", typeName: "Foo" },
  permissions: {
    canRead: ["anyone"],
    canCreate: ["anyone"],
  },
});

/**
 * Bar knows about Foo
 */
const BarModel = createGraphqlModelServer({
  schema: {
    bar: {
      type: String,
    },
    fooId: {
      type: String,
      relation: {
        model: FooModel,
        kind: "hasOne",
      },
      // Foo also has one "bar" and can resolve, but it's a virtual field
      // => Foo doesn't know about it!
      // From the Foo standpoint,
      // it will resolve "the Bar whose fooId is equal to the current Foo _id"
      reversedRelation: {
        model: FooModel,
        kind: "hasOne",
        foreignFieldName: "bar",
      },
    },
  } as VulcanGraphqlSchemaServer,
  name: "Bar",
  graphql: {
    multiTypeName: "Bars",
    typeName: "Bar",
  },
  permissions: {
    canRead: ["anyone"],
    canCreate: ["anyone"],
  },
});

describe("hasOne with virtual field", () => {
  test("generate a type for a field with an hasOne relation", () => {
    const res = parseAllModels([FooModel, BarModel]);
    expect(res.typeDefs).toBeDefined();
    // debug
    //console.log(res.typeDefs);
    const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
    // the "bar" field of Foo is "virtual",
    // it is computed by searching all Bar whose fooId matches foo._id
    expect(normalizedSchema).toMatch(
      "type Foo { _id: String foo: String bar: Bar } type Bar { _id: String fooId: String foo: Foo"
    );
  });
});
