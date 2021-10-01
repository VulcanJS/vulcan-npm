/**
 * Test automatic graphql schema generation
 * (= type definitions)
 */

import { createGraphqlModelServer } from "../../../extendModel.server";
import { normalizeGraphQLSchema } from "../../../testUtils";
import { parseSchema } from "../../parseSchema";
import { parseModel } from "../../parseModel";
import { buildDefaultMutationResolvers } from "../../resolvers/defaultMutationResolvers";
import { buildDefaultQueryResolvers } from "../../resolvers/defaultQueryResolvers";
import { getGraphQLType } from "../../../utils";

const FooModel = (schema) =>
  createGraphqlModelServer({
    schema,
    name: "Foo",
    graphql: { multiTypeName: "Foos", typeName: "Foo" },
  });

describe("graphql/typeDefs", () => {
  // TODO: handle the graphQL init better to fix those tests
  /*
  describe("generateResolversFromSchema - generate a secure resolver for each field", () => {
    const context = {
      currentUser: null,
      Users,
    };
    test("get the resolvers for a field", () => {
      const resolvers = generateResolversFromSchema(
        {
          foo: {
            type: String,
            canRead: ["guests"],
          },
        })
      );
      const fooResolver = resolvers["foo"];
      expect(fooResolver).toBeInstanceOf(Function);
      expect(fooResolver({ foo: "bar" }, null, context)).toEqual("bar");
    });
    test("ignore non readable fields", () => {
      const resolvers = generateResolversFromSchema(
        {
          foo: {
            type: String,
            canRead: ["admins"],
          },
        })
      );
      const fooResolver = resolvers["foo"];
      expect(fooResolver({ foo: "bar" }, null, context)).toBeNull();
    });
    test("convert undefined fields into null", () => {
      const resolvers = generateResolversFromSchema(
        {
          foo: {
            type: String,
            canRead: ["admins"],
          },
        })
      );
      const fooResolver = resolvers["foo"];
      expect(fooResolver({ foo2: "bar" }, null, context)).toBeNull();
    });
    test("do NOT convert other falsy fields into null", () => {
      const resolvers = generateResolversFromSchema(
        {
          foo: {
            type: Number,
            canRead: ["guests"],
          },
        })
      );
      const fooResolver = resolvers["foo"];
      expect(fooResolver({ foo: 0 }, null, context)).toEqual(0);
    });
  });
*/
  describe("field parsing - getGraphQLType - associate a graphQL type to a field", () => {
    test("return nested type for nested objects", () => {
      const schema = {
        nestedField: {
          type: {
            firstNestedField: {
              type: String,
            },
            secondNestedField: {
              type: Number,
            },
          },
        },
      };
      const type = getGraphQLType({
        schema,
        fieldName: "nestedField",
        typeName: "Foo",
      });
      expect(type).toBe("FooNestedField");
    });
    test("return JSON for nested objects with blackbox option", () => {
      const schema = {
        nestedField: {
          optional: true,
          blackbox: true,
          type: {
            firstNestedField: {
              type: String,
            },
            secondNestedField: {
              type: Number,
            },
          },
        },
      };
      const type = getGraphQLType({
        schema,
        fieldName: "nestedField",
        typeName: "Foo",
      });
      expect(type).toBe("JSON");
    });
    test("return JSON for nested objects that are actual JSON objects", () => {
      const schema = {
        nestedField: {
          type: Object,
          typeName: "JSON", // typeName is mandatory otherwise it is considered a nested field
        },
      };
      const type = getGraphQLType({
        schema,
        fieldName: "nestedField",
        typeName: "Foo",
      });
      expect(type).toBe("JSON");
    });
    test("return JSON for child of blackboxed array", () => {
      const schema = {
        arrayField: {
          type: Array,
          blackbox: true,
        },
        "arrayField.$": {
          type: {
            someField: {
              type: String,
            },
          },
        },
      };
      const type = getGraphQLType({
        schema,
        fieldName: "arrayField",
        typeName: "Foo",
      });
      expect(type).toBe("[JSON]");
    });

    test("return JSON for input type if provided typeName is JSON", () => {
      const schema = {
        nestedField: {
          type: Object,
          typeName: "JSON",
        },
      };
      const inputType = getGraphQLType({
        schema,
        fieldName: "nestedField",
        typeName: "Foo",
        isInput: true,
      });
      expect(inputType).toBe("JSON");
    });

    test("return nested  array type for arrays of nested objects", () => {
      const schema = {
        arrayField: {
          type: Array,
          canRead: ["admins"],
        },
        "arrayField.$": {
          type: {
            firstNestedField: {
              type: String,
            },
            secondNestedField: {
              type: Number,
            },
          },
        },
      };
      const type = getGraphQLType({
        schema,
        fieldName: "arrayField",
        typeName: "Foo",
      });
      expect(type).toBe("[FooArrayField]");
    });
    test("return basic array type for array of primitives", () => {
      const schema = {
        arrayField: {
          type: Array,
          canRead: ["admins"],
        },
        "arrayField.$": {
          type: String,
        },
      };
      const type = getGraphQLType({
        schema,
        fieldName: "arrayField",
        typeName: "Foo",
      });
      expect(type).toBe("[String]");
    });

    test("return JSON if blackbox is true", () => {});
  });

  describe("schema parsing - parseSchema - get the fields to add to graphQL schema as a JS representation", () => {
    test("fields without permissions are ignored", () => {
      const schema = {
        field: {
          type: String,
          canRead: ["admins"],
        },
        ignoredField: {
          type: String,
        },
      };
      const fields = parseSchema(schema, "Foo");
      const mainType = fields.fields.mainType;
      expect(mainType).toHaveLength(1);
      expect(mainType[0].name).toEqual("field");
    });
    test("nested fields without permissions are ignored", () => {
      const schema = {
        nestedField: {
          type: {
            firstNestedField: {
              type: String,
              canRead: ["admins"],
            },
            ignoredNestedField: {
              type: Number,
            },
          },
          canRead: ["admins"],
        },
      };
      const fields = parseSchema(schema, "Foo");
      const nestedFields = fields.nestedFieldsList[0];
      // one field in the nested object
      expect(nestedFields?.fields?.mainType).toHaveLength(1);
      expect(nestedFields?.fields?.mainType[0].name).toEqual(
        "firstNestedField"
      );
    });
    test("generate fields for nested objects", () => {
      const schema = {
        nestedField: {
          type: {
            firstNestedField: {
              type: String,
              canRead: ["admins"],
            },
            secondNestedField: {
              type: Number,
              canRead: ["admins"],
            },
          },
          canRead: ["admins"],
        },
      };

      const fields = parseSchema(schema, "Foo");
      // one nested object
      expect(fields.nestedFieldsList).toHaveLength(1);
      const nestedFields = fields.nestedFieldsList[0];
      expect(nestedFields.typeName).toEqual("FooNestedField");
      // one field in the nested object
      expect(nestedFields?.fields?.mainType).toHaveLength(2);
      expect(nestedFields?.fields?.mainType[0].name).toEqual(
        "firstNestedField"
      );
      expect(nestedFields?.fields?.mainType[1].name).toEqual(
        "secondNestedField"
      );
    });
  });
  describe("model parsing to GraphQL schema and type", () => {
    describe("basic", () => {
      test("generate a type for a simple collection", () => {
        const model = FooModel({
          field: {
            type: String,
            canRead: ["admins"],
          },
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch("type Foo { field: String }");
      });
      test("use provided graphQL type if any", () => {
        const model = FooModel({
          field: {
            type: String,
            typeName: "StringEnum",
            canRead: ["admins"],
          },
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch("type Foo { field: StringEnum }");
      });
    });
    describe("nested objects and arrays", () => {
      test("generate type for a nested field", () => {
        const model = FooModel({
          nestedField: {
            type: {
              subField: {
                type: String,
                canRead: ["admins"],
              },
            },
            canRead: ["admins"],
          },
        });
        const res = parseModel(model);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "type Foo { nestedField: FooNestedField }"
        );
        expect(normalizedSchema).toMatch(
          "type FooNestedField { subField: String }"
        );
      });
      test("generate graphQL type for array of nested objects", () => {
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
        const res = parseModel(model);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "type Foo { arrayField: [FooArrayField] }"
        );
        expect(normalizedSchema).toMatch(
          "type FooArrayField { subField: String }"
        );
      });
      test("ignore field if parent is blackboxed", () => {
        const model = FooModel({
          blocks: {
            type: Array,
            canRead: ["admins"],
            blackbox: true,
          },
          "blocks.$": {
            type: {
              addresses: {
                type: Array,
                canRead: ["admins"],
              },
              "addresses.$": {
                type: {
                  street: {
                    type: String,
                    canRead: ["adminst"],
                  },
                },
                canRead: ["admins"],
              },
            },
            canRead: ["admins"],
          },
        });
        const res = parseModel(model);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch("type Foo { blocks: [JSON] }");
      });
    });

    describe("nesting with referenced field", () => {
      test("use referenced graphQL type if provided for nested object", () => {
        const model = FooModel({
          nestedField: {
            type: Object,
            blackbox: true,
            typeName: "AlreadyRegisteredNestedType",
            canRead: ["admins"],
          },
        });
        const res = parseModel(model);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "type Foo { nestedField: AlreadyRegisteredNestedType }"
        );
        expect(normalizedSchema).not.toMatch("FooNestedField");
      });

      // TODO: does this test case make any sense?
      test("do NOT generate graphQL type if an existing graphQL type is referenced", () => {
        const model = FooModel({
          nestedField: {
            type: {
              subField: {
                type: String,
                canRead: ["admins"],
              },
            },
            typeName: "AlreadyRegisteredNestedType",
            canRead: ["admins"],
          },
        });
        const res = parseModel(model);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "type Foo { nestedField: AlreadyRegisteredNestedType }"
        );
        expect(normalizedSchema).not.toMatch("FooNestedField");
      });
      test("do NOT generate graphQL type for array of nested objects if an existing graphQL type is referenced", () => {
        const model = FooModel({
          arrayField: {
            type: Array,
            canRead: ["admins"],
          },
          "arrayField.$": {
            typeName: "AlreadyRegisteredType",
            type: {
              subField: {
                type: String,
                canRead: ["admins"],
              },
            },
            canRead: ["admins"],
          },
        });
        const res = parseModel(model);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "type Foo { arrayField: [AlreadyRegisteredType] }"
        );
        expect(normalizedSchema).not.toMatch(
          "type FooArrayField { subField: String }"
        );
      });
    });
  });

  /*
  describe("intl", () => {
    test("generate type for intl fields", () => {
      const model = FooModel(
        addIntlFields(
          // we need to do this manually, it is handled by a callback when creating the collection
          {
            intlField: {
              intl: true,
              type: String,
              canRead: ["admins"],
            },
          }
        )
      );
      const res = parseModel(model);
      const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
      expect(normalizedSchema).toMatch(
        "type Foo { intlField(locale: String): String @intl intlField_intl(locale: String): [IntlValue] @intl }"
      );
    });
    test.skip("generate type for array of intl fields", () => {
      const model = FooModel(
        addIntlFields(
          // we need to do this manually, it is handled by a callback when creating the collection
          {
            arrayField: {
              type: Array,
              canRead: ["admins"],
            },
            "arrayField.$": {
              type: String,
              intl: true,
              canRead: ["admins"],
            },
          }
        )
      );
      const res = parseModel(model);
      const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
      expect(normalizedSchema).toMatch(
        "type Foo { arrayField: [[IntlValue]] }"
      );
    });
    test("generate correct type for nested intl fields", () => {
      const model = FooModel({
        nestedField: {
          type: 
            addIntlFields(
              // we need to do this manually, it is handled by a callback when creating the collection
              {
                intlField: {
                  type: String,
                  intl: true,
                  canRead: ["admins"],
                },
              }
            )
          ),
          canRead: ["admins"],
        },
      });
      const res = parseModel(model);
      const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
      expect(normalizedSchema).toMatch(
        "type Foo { nestedField: FooNestedField }"
      );
      expect(normalizedSchema).toMatch(
        "type FooNestedField { intlField(locale: String): String @intl intlField_intl(locale: String): [IntlValue] @intl }"
      );
    });
  });
*/
  describe("resolveAs", () => {
    test("generate a type for a field with resolveAs and custom resolver", () => {
      const model = FooModel({
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
      const model = FooModel({
        field: {
          type: String,
          optional: true,
          canRead: ["admins"],
          resolveAs: {
            fieldName: "resolvedField",
            type: "Bar",
            resolver: (document, args, context) => {
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
      const model = FooModel({
        field: {
          type: String,
          optional: true,
          canRead: ["admins"],
          resolveAs: [
            {
              fieldName: "resolvedField",
              type: "Bar",
              resolver: () => "bar",
              addOriginalField: true,
            },
            {
              fieldName: "anotherResolvedField",
              type: "Bar",
              resolver: () => "bar",
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
  });
  describe("resolveAs - relation", () => {
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
  /*

  /*
    Feature removed
    generating enums from allowed values automatically => bad idea, could be a manual helper instead
    describe('enums', () => {
      test('don\'t generate enum type when some values are not allowed', () => {
        const model = FooModel({
          withAllowedField: {
            type: String,
            canRead: ['admins'],
            allowedValues: ['français', 'bar'] // "ç" is not accepted, Enum must be a name
          }
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch('type Foo { withAllowedField: String }');
        expect(normalizedSchema).not.toMatch('type Foo { withAllowedField: FooWithAllowedFieldEnum }');
        expect(normalizedSchema).not.toMatch('enum FooWithAllowedFieldEnum { français bar }');
      });
      test('fail when allowedValues are not string', () => {
        const model = FooModel({
          withAllowedField: {
            type: String,
            canRead: ['admins'],
            allowedValues: [0, 1] // "ç" is not accepted, Enum must be a name
          }
        });
        expect(() => parseModel(model)).toThrow();
      });
      test('generate enum type when allowedValues is defined and field is a string', () => {
        const model = FooModel({
          withAllowedField: {
            type: String,
            canRead: ['admins'],
            allowedValues: ['foo', 'bar']
          }
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch('type Foo { withAllowedField: FooWithAllowedFieldEnum }');
        expect(normalizedSchema).toMatch('enum FooWithAllowedFieldEnum { foo bar }');
      });
      test('generate enum type for nested objects', () => {
        test('generate enum type when allowedValues is defined and field is a string', () => {
          const model = FooModel({
            nestedField: {
              type: {
                withAllowedField: {
                  type: String,
                  allowedValues: ['foo', 'bar'],
                  canRead: ['admins'],
                }
              }),
              canRead: ['admins'],
            }
          });
          const res = parseModel(model);
          expect(res.typeDefs).toBeDefined();
          // debug
          //console.log(res.typeDefs);
          const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
          expect(normalizedSchema).toMatch('type Foo { nestedField { withAllowedField: FooNestedFieldWithAllowedFieldEnum } }');
          expect(normalizedSchema).toMatch('enum FooNestedFieldWithAllowedFieldEnum { foo bar }');
        });
     
      });
     
      test('2 level of nesting', () => {
        const model = FooModel({
          entrepreneurLifeCycleHistory: {
            type: Array,
            optional: true,
            canRead: ['admins', 'mods'],
            //onUpdate: entLifecycleHistoryOnUpdate,
          },
          'entrepreneurLifeCycleHistory.$': {
            type: 
              {
                entrepreneurLifeCycleState: {
                  type: String,
                  // canCreate: ['admins', 'mods'],
                  canRead: ['admins', 'mods'],
                  // canUpdate: ['admins', 'mods'],
                  input: 'select',
                  options: [
                    { value: 'booster', label: 'Booster' },
                    { value: 'explorer', label: 'Explorer' },
                    { value: 'starter', label: 'Starter' },
                    { value: 'tester', label: 'Tester' },
                  ],
                  allowedValues: ['booster', 'explorer', 'starter', 'tester'],
                },
              }
            )
          },
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch('type Foo { entrepreneurLifeCycleHistory: [FooEntrepreneurLifeCycleHistory]');
        expect(normalizedSchema).toMatch('type FooEntrepreneurLifeCycleHistory { entrepreneurLifeCycleState: FooEntrepreneurLifeCycleHistoryEntrepreneurLifeCycleStateEnum');
        expect(normalizedSchema).toMatch('enum FooEntrepreneurLifeCycleHistoryEntrepreneurLifeCycleStateEnum { booster explorer starter tester }');
      });
     
      test("support enum type in array children", () => {
        throw new Error("test not written yet")
        const schema = {
          arrayField : { ... }
          "arrayField.$": {
            type: String,
            allowedValues: [...] // whatever
          } 
        }
      })
    });
    */

  /*
    describe("mutation inputs", () => {
      test("generate creation input", () => {
        const model = FooModel({
          field: {
            type: String,
            canRead: ["admins"],
            canCreate: ["admins"],
          },
        });
        const res = parseModel(model);
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "input CreateFooInput { data: CreateFooDataInput! }"
        );
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { field: String }"
        );
      });
      test("generate inputs for nested objects", () => {
        const model = FooModel({
          nestedField: {
            type: {
              someField: {
                type: String,
                canRead: ["admins"],
                canCreate: ["admins"],
              },
            }),
            canRead: ["admins"],
            canCreate: ["admins"],
          },
        });
        const res = parseModel(model);
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        // TODO: not 100% of the expected result
        expect(normalizedSchema).toMatch(
          "input CreateFooInput { data: CreateFooDataInput! }"
        );
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { nestedField: CreateFooNestedFieldDataInput }"
        );
        expect(normalizedSchema).toMatch(
          "input CreateFooNestedFieldDataInput { someField: String }"
        );
      });
      test("generate inputs for array of nested objects", () => {
        const model = FooModel({
          arrayField: {
            type: Array,
            canRead: ["admins"],
            canCreate: ["admins"],
          },
          "arrayField.$": {
            canRead: ["admins"],
            canCreate: ["admins"],
            type: {
              someField: {
                type: String,
                canRead: ["admins"],
                canCreate: ["admins"],
              },
            }),
          },
        });
        const res = parseModel(model);
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        // TODO: not 100% sure of the syntax
        expect(normalizedSchema).toMatch(
          "input CreateFooInput { data: CreateFooDataInput! }"
        );
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { arrayField: [CreateFooArrayFieldDataInput] }"
        );
        expect(normalizedSchema).toMatch(
          "input CreateFooArrayFieldDataInput { someField: String }"
        );
      });
      test("do NOT generate new inputs for array of JSON", () => {
        const model = FooModel({
          arrayField: {
            type: Array,
            canRead: ["admins"],
            canCreate: ["admins"],
          },
          "arrayField.$": {
            canRead: ["admins"],
            canCreate: ["admins"],
            type: Object,
          },
        });
        const res = parseModel(model);
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        // TODO: not 100% sure of the syntax
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { arrayField: [JSON] }"
        );
        expect(normalizedSchema).not.toMatch("CreateJSONDataInput");
      });
      test("do NOT generate new inputs for blackboxed array", () => {
        const model = FooModel({
          arrayField: {
            type: Array,
            canRead: ["admins"],
            canCreate: ["admins"],
            blackbox: true,
          },
          "arrayField.$": {
            canRead: ["admins"],
            canCreate: ["admins"],
            type: {
              foo: {
                type: String,
                canRead: ["admins"],
                canUpdate: ["admins"],
              },
            }),
          },
        });
        const res = parseModel(model);
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { arrayField: [JSON] }"
        );
        expect(normalizedSchema).not.toMatch("CreateJSONDataInput");
      });

      test("do NOT generate new inputs for nested objects if a type is provided", () => {
        const model = FooModel({
          nestedField: {
            type: {
              someField: {
                type: String,
                canRead: ["admins"],
                canCreate: ["admins"],
              },
            }),
            typeName: "AlreadyRegisteredType",
            canRead: ["admins"],
            canCreate: ["admins"],
          },
        });
        const res = parseModel(model);
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        // TODO: not 100% of the expected result
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { nestedField: CreateAlreadyRegisteredTypeDataInput }"
        );
        expect(normalizedSchema).not.toMatch("CreateFooNestedFieldDataInput");
      });
      test("do NOT generate new inputs for array of objects if typeName is provided", () => {
        const model = FooModel({
          arrayField: {
            type: Array,
            canRead: ["admins"],
            canCreate: ["admins"],
          },
          "arrayField.$": {
            canRead: ["admins"],
            canCreate: ["admins"],
            typeName: "AlreadyRegisteredType",
            type: {
              someField: {
                type: String,
                canRead: ["admins"],
                canCreate: ["admins"],
              },
            }),
          },
        });
        const res = parseModel(model);
        // debug
        //console.log(res.typeDefs);
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        // TODO: not 100% sure of the syntax
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { arrayField: [CreateAlreadyRegisteredTypeDataInput] }"
        );
        expect(normalizedSchema).not.toMatch("CreateFooArrayFieldDataInput");
      });

      test("ignore resolveAs", () => {
        const model = FooModel({
          nestedField: {
            canRead: ["admins"],
            canCreate: ["admins"],
            type: {
              someField: {
                type: String,
                optional: true,
                canRead: ["admins"],
                resolveAs: {
                  fieldName: "resolvedField",
                  type: "Bar",
                  resolver: (collection, args, context) => {
                    return "bar";
                  },
                },
              },
            }),
          },
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).not.toMatch(
          "input CreateFooNestedFieldDataInput"
        );
      });
      test("ignore resolveAs with addOriginalField when generating nested create input", () => {
        const model = FooModel({
          nestedField: {
            canRead: ["admins"],
            canCreate: ["admins"],
            type: {
              someField: {
                type: String,
                optional: true,
                canRead: ["admins"],
                canCreate: ["admins"],
                resolveAs: {
                  fieldName: "resolvedField",
                  type: "Bar",
                  resolver: (collection, args, context) => {
                    return "bar";
                  },
                  addOriginalField: true,
                },
              },
            }),
          },
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).toMatch(
          "input CreateFooInput { data: CreateFooDataInput! }"
        );
        expect(normalizedSchema).toMatch(
          "input CreateFooDataInput { nestedField: CreateFooNestedFieldDataInput }"
        );
        expect(normalizedSchema).toMatch(
          "input CreateFooNestedFieldDataInput { someField: String }"
        );
      });

      test("do not generate generic input type for direct nested arrays or objects (only appliable to referenced types)", () => {
        // TODO: test is over complex because of a previous misunderstanding, can be simplified
        const model = FooModel({
          arrayField: {
            type: Array,
            optional: true,
            canRead: ["admins"],
            canCreate: ["admins"],
            canUpdate: ["admins"],
          },
          "arrayField.$": {
            type: {
              someFieldId: {
                type: String,
                optional: true,
                canRead: ["admins"],
                resolveAs: {
                  fieldName: "someField",
                  type: "User",
                  resolver: (collection, args, context) => {
                    return { foo: "bar" };
                  },
                  addOriginalField: true,
                },
              },
            }),
          },
        });
        const res = parseModel(model);
        expect(res.typeDefs).toBeDefined();
        const normalizedSchema = normalizeGraphQLSchema(res.typeDefs);
        expect(normalizedSchema).not.toMatch("input FooArrayFieldInput");
      });
    });
  });

  describe("resolvers", () => {
    test.skip("use default resolvers if none is specified", () => {});
    test.skip('do not add default resolvers if "null" is specified', () => {});
    test.skip("use provided resolvers if any", () => {});
  });
  describe("mutations", () => {
    test.skip("use default resolvers if none is specified", () => {});
    test.skip('do not add default resolvers if "null" is specified', () => {});
    test.skip("use provided resolvers if any", () => {});
  });
  */

  describe("model resolvers", () => {
    test("generate query resolver types", () => {
      const Foo = createGraphqlModelServer({
        schema: {
          foo: {
            type: String,
            canRead: ["guests"],
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
        name: "Foo",
        graphql: {
          multiTypeName: "Foos",
          typeName: "Foo",
          // you have to explicitely pass the default query resolvers if you want some
          queryResolvers: buildDefaultQueryResolvers({ typeName: "Foo" }),
        },
      });
      const { queries } = parseModel(Foo);
      expect(queries).toHaveLength(2); // single and multi
      if (!queries) return;
      if (queries.length < 2) return; // to make ts happy
      const single = queries[0];
      const multi = queries[1];
      expect(single.query).toContain("foo(");
      expect(multi.query).toContain("foos(");
    });
    test("generate mutation resolver types", () => {
      const Foo = createGraphqlModelServer({
        schema: {
          foo: {
            type: String,
            canRead: ["guests"],
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
        name: "Foo",
        graphql: {
          multiTypeName: "Foos",
          typeName: "Foo",
          // you have to explicitely pass the default query resolvers if you want some
          mutationResolvers: buildDefaultMutationResolvers({
            typeName: "Foo",
          }),
        },
      });
      const { mutations } = parseModel(Foo);
      expect(mutations).toHaveLength(3); // create, update, delete
      if (!mutations) return;
      if (mutations.length < 3) return; // make ts happy
      const create = mutations[0];
      const update = mutations[1];
      const deleteMutation = mutations[2];

      expect(create.mutation).toContain("createFoo(");
      expect(update.mutation).toContain("updateFoo(");
      expect(deleteMutation.mutation).toContain("deleteFoo(");
    });
  });
});
