import { validateDocument, validateData } from "../resolvers/validation";
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
      const errors = validateDocument({ foo: "bar" }, model, defaultContext);
      expect(errors).toHaveLength(0);
      const updateErrors = validateData({ foo: "bar" }, model, defaultContext);
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
      const errors = validateDocument(
        { foo: "bar", bar: "foo" },
        model,
        defaultContext
      );
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "foo" },
      });
      const updateErrors = validateData(
        { foo: "bar", bar: "foo" },
        model,
        defaultContext
      );
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
      const errors = validateDocument(
        { nested: { foo: "bar", bar: "foo" } },
        model,
        defaultContext
      );
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested.foo" },
      });
      // update with set and unset
      const updateErrors = validateData(
        { nested: { foo: "bar", bar: "foo", zed: null } },
        // { nested: { foo: "bar", bar: "foo", zed: "hello" } },
        model,
        defaultContext
      );
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
      const errors = validateDocument(
        { nested: [{ foo: "bar", bar: "foo" }] },
        model,
        defaultContext
      );
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested[0].foo" },
      });

      const updateErrors = validateData(
        { nested: [{ foo: "bar", bar: "foo" }] },
        // { nested: [{ foo: "bar", bar: "foo" }] },
        model,
        defaultContext
      );
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
      const errors = validateDocument(
        { nested: { nok: "bar", ok: "foo" } },
        model,
        defaultContext
      );
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested.nok" },
      });
      // update with set and unset
      const updateErrors = validateData(
        { nested: { nok: "bar", ok: "foo", zed: null } },
        // { nested: { nok: "bar", ok: "foo", zed: "hello" } },
        model,
        defaultContext
      );
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
      const errors = validateDocument(
        { nested: { foo: "bar" } },
        model,
        defaultContext
      );
      expect(errors).toHaveLength(0);

      const updateErrors = validateData(
        { nested: { foo: "bar" } },
        // { nested: { foo: "bar" } },
        model,
        defaultContext
      );
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
      const errors = validateDocument(
        { array: [1, 2, 3] },
        model,
        defaultContext
      );
      expect(errors).toHaveLength(0);

      const updateErrors = validateData(
        { array: [1, 2, 3] },
        // { array: [1, 2, 3] },
        model,
        defaultContext
      );
      expect(updateErrors).toHaveLength(0);
    });
  });
});
