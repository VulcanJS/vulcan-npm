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
    },
  });

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
    expect(normalizedSchema).toMatch("type Foo { fieldId: String field: Bar }");
  });
  // FIXME: the models are not right, they don't generate "Create" types desite permissions being set correctly
  test.skip("respect the typeName of the id", () => {
    const BarModel = createGraphqlModelServer({
      schema: {
        name: { type: String, canRead: ["anyone"], canCreate: ["anyone"] },
      },
      name: "Bar",
      graphql: { multiTypeName: "Bars", typeName: "Bar" },
      permissions: {
        canRead: ["anyone"],
        canCreate: ["anyone"],
      },
    });
    const model = FooModel({
      fieldId: {
        type: String,
        typeName: "FieldIdTypeName",
        canRead: ["admins"],
        canCreate: ["anyone"],
        relation: {
          model: BarModel,
          fieldName: "field",
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
      "type Foo { fieldId: FieldIdTypeName field: Bar }"
    );
    expect(normalizedSchema).toMatch(
      "CreateFooFilterInput { fieldId: FieldIdTypeName field: Bar }"
    );
  });
});

describe("belongsToOne", () => {
  test("generate a type for a field with an belongsToOne relation", () => {
    const FooModel = createGraphqlModelServer({
      schema: {
        _id: {
          type: String,
          canRead: ["anyone"],
        },
        foo: {
          type: String,
          canRead: ["anyone"],
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
          canRead: ["anyone"],
        },
        fooId: {
          type: String,
          relation: {
            fieldName: "foo",
            model: FooModel,
            kind: "hasOne",
          },
          // Foo also has one "bar" and can resolve, but it's a virtual field
          // => Foo doesn't know about it!
          // From the Foo standpoint,
          // it will resolve "the Bar whose fooId is equal to the current Foo _id"
          // Permissions will be the same as "fooId" field, since the resolver
          // will use 'Bar.fooId' to find the Bar
          reversedRelation: {
            model: FooModel,
            kind: "belongsToOne",
            foreignFieldName: "bar",
          },
          canRead: ["anyone"],
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
    const res = parseModel(BarModel);
    expect(res.typeDefs).toBeDefined();
    // debug
    console.log(res.typeDefs);
    // the "bar" field of Foo is "virtual",
    // it is computed by searching all Bar whose fooId matches foo._id
    const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
    expect(normalizedSchema).toMatch(
      "type Bar { bar: String fooId: String foo: Foo }"
    );
    expect(normalizedSchema).toMatch("extend type Foo { bar: Bar }");
    //expect(normalizedSchema).toMatch(
    //  "type Foo { _id: String foo: String bar: Bar }"
    //);
  });
});
