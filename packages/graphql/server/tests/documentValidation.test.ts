import { validateDatas } from "../resolvers/validation";
import { createModel } from "@vulcanjs/model";
// import Users from "meteor/vulcan:users"

const test = it;

const defaultContext = {};
describe("vulcan:lib/validation", () => {
  describe("validate document permissions per field (on creation and update)", () => {
    test("no error if all fields are creatable", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          foo: {
            type: String,
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      // create
      const errors = validateDatas({ document: { foo: "bar" }, model, context: defaultContext, mutatorName: 'create' });
      expect(errors).toHaveLength(0);
      const updateErrors = validateDatas({ document: { foo: "bar" }, model, context: defaultContext, mutatorName: 'update' });
      expect(updateErrors).toHaveLength(0);
    });
    test("create error for non creatable field", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          foo: {
            type: String,
            canCreate: ["members"],
            canUpdate: ["members"],
          },
          bar: {
            type: String,
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      const errors = validateDatas({
        document: { foo: "bar", bar: "foo" },
        model,
        context: defaultContext,
        mutatorName: 'create'
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "foo" },
      });
      const updateErrors = validateDatas({
        document: { foo: "bar", bar: "foo" },
        model,
        context: defaultContext,
        mutatorName: 'update'
      });
      expect(updateErrors).toHaveLength(1);
      expect(updateErrors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "foo" },
      });
    });

    test("create error for non creatable nested field (object)", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          nested: {
            type: {
              foo: {
                type: String,
                canCreate: ["members"],
                canUpdate: ["members"],
              },
              zed: {
                optional: true,
                type: String,
                canCreate: ["members"],
                canUpdate: ["members"],
              },
              bar: {
                type: String,
                canCreate: ["guests"],
                canUpdate: ["guests"],
              },
            },
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      // create
      const errors = validateDatas({
        document: { nested: { foo: "bar", bar: "foo" } },
        model,
        context: defaultContext,
        mutatorName: 'create'
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested.foo" },
      });
      // update with set and unset
      const updateErrors = validateDatas({
        document: { nested: { foo: "bar", bar: "foo", zed: null } },
        // document: { nested: { foo: "bar", bar: "foo", zed: 'hello' } },
        model,
        context: defaultContext,
        mutatorName: 'update'
      });
      expect(updateErrors).toHaveLength(2);
      expect(updateErrors[0]).toMatchObject(
        {
          id: "errors.disallowed_property_detected",
          properties: { name: "nested.foo" },
        } /*,
        {
          id: "errors.disallowed_property_detected",
          properties: { name: "nested.zed" },
        }*/
      );
    });
    test("create error for non creatable nested field (array)", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          nested: {
            type: Array,
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
          "nested.$": {
            type: {
              foo: {
                type: String,
                canCreate: ["members"],
                canUpdate: ["members"],
              },
              bar: {
                type: String,
                canCreate: ["guests"],
                canUpdate: ["guests"],
              },
            },
          },
        },
      });
      const errors = validateDatas({
        document: { nested: [{ foo: "bar", bar: "foo" }] },
        model,
        context: defaultContext,
        mutatorName: 'create'
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested[0].foo" },
      });

      const updateErrors = validateDatas({
        document: { nested: [{ foo: "bar", bar: "foo" }] },
        model,
        context: defaultContext,
        mutatorName: 'update'
      });
      expect(updateErrors).toHaveLength(1);
      expect(updateErrors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested[0].foo" },
      });
    });

    test("ignore nested fields without permissions (use parent permissions)", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          nested: {
            type: {
              nok: {
                type: String,
                canCreate: ["members"],
                canUpdate: ["members"],
              },
              ok: {
                type: String,
              },
              zed: {
                optional: true,
                type: String,
                canCreate: ["members"],
                canUpdate: ["members"],
              },
            },
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      // create
      const errors = validateDatas({
        document: { nested: { nok: "bar", ok: "foo" } },
        model,
        context: defaultContext,
        mutatorName: 'create'
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested.nok" },
      });
      // update with set and unset
      const updateErrors = validateDatas({
        document: { nested: { nok: "bar", ok: "foo", zed: null } },
        // document: { nested: { nok: "bar", ok: "foo", zed: "hello" } }, 
        model,
        context: defaultContext,
        mutatorName: 'update'
      });
      expect(updateErrors).toHaveLength(2);
      expect(updateErrors[0]).toMatchObject(
        {
          id: "errors.disallowed_property_detected",
          properties: { name: "nested.nok" },
        } /*,
        {
          id: "errors.disallowed_property_detected",
          properties: { name: "nested.zed" },
        }*/
      );
    });

    test("do not check permissions of blackbox JSON", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          nested: {
            type: {
              foo: {
                type: String,
                canCreate: ["members"],
                canUpdate: ["members"],
              },
            },
            blackbox: true,
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      const errors = validateDatas({
        document: { nested: { foo: "bar" } },
        model,
        context: defaultContext,
        mutatorName: 'create'
      });
      expect(errors).toHaveLength(0);

      const updateErrors = validateDatas({
        document: { nested: { foo: "bar" } },
        model,
        context: defaultContext,
        mutatorName: 'update'
      });
      expect(updateErrors).toHaveLength(0);
    });
    test("do not check native arrays", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          array: {
            type: Array,
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
          "array.$": {
            type: Number,
          },
        },
      });
      const errors = validateDatas({
        document: { array: [1, 2, 3] },
        model,
        context: defaultContext,
        mutatorName: 'create'
      });
      expect(errors).toHaveLength(0);

      const updateErrors = validateDatas({
        document: { array: [1, 2, 3] },
        model,
        context: defaultContext,
        mutatorName: 'update'
      });
      expect(updateErrors).toHaveLength(0);
    });
  });
});
