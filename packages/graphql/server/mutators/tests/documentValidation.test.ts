import { validateData } from "..";
import { createModel } from "@vulcanjs/model";
// import Users from "meteor/vulcan:users"

const test = it;

describe("vulcan:lib/validation", () => {
  describe("validate document permissions per field (on creation and update)", () => {
    const guestsPermissions = {
      type: String,
      canCreate: ["guests"],
      canUpdate: ["guests"],
    };
    const membersPermissions = {
      type: String,
      canCreate: ["members"],
      canUpdate: ["members"],
    };
    test("no error if all fields are creatable", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          foo: guestsPermissions,
        },
      });
      // create
      const errors = validateData({
        document: { foo: "bar" },
        model,
        mutatorName: "create",
      });
      expect(errors).toHaveLength(0);
      const updateErrors = validateData({
        document: { foo: "bar" },
        model,
        mutatorName: "update",
      });
      expect(updateErrors).toHaveLength(0);
    });
    test("create error for non creatable field", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          foo: membersPermissions,
          bar: guestsPermissions,
        },
      });
      const errors = validateData({
        document: { foo: "bar", bar: "foo" },
        model,
        mutatorName: "create",
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "foo" },
      });
      const updateErrors = validateData({
        document: { foo: "bar", bar: "foo" },
        model,
        mutatorName: "update",
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
              foo: membersPermissions,
              zed: Object.assign(membersPermissions, { optional: true }),
              bar: guestsPermissions,
            },
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      // create
      const errors = validateData({
        document: { nested: { foo: "bar", bar: "foo" } },
        model,
        mutatorName: "create",
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested.foo" },
      });
      // update with set and unset
      const updateErrors = validateData({
        document: { nested: { foo: "bar", bar: "foo", zed: null } },
        // document: { nested: { foo: "bar", bar: "foo", zed: 'hello' } },
        model,
        mutatorName: "update",
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
              foo: membersPermissions,
              bar: guestsPermissions,
            },
          },
        },
      });
      const errors = validateData({
        document: { nested: [{ foo: "bar", bar: "foo" }] },
        model,
        mutatorName: "create",
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested[0].foo" },
      });

      const updateErrors = validateData({
        document: { nested: [{ foo: "bar", bar: "foo" }] },
        model,
        mutatorName: "update",
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
              nok: membersPermissions,
              ok: {
                type: String,
              },
              zed: Object.assign(membersPermissions, { optional: true }),
            },
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      // create
      const errors = validateData({
        document: { nested: { nok: "bar", ok: "foo" } },
        model,
        mutatorName: "create",
      });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        id: "errors.disallowed_property_detected",
        properties: { name: "nested.nok" },
      });
      // update with set and unset
      const updateErrors = validateData({
        document: { nested: { nok: "bar", ok: "foo", zed: null } },
        // document: { nested: { nok: "bar", ok: "foo", zed: "hello" } },
        model,
        mutatorName: "update",
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
              foo: membersPermissions,
            },
            blackbox: true,
            canCreate: ["guests"],
            canUpdate: ["guests"],
          },
        },
      });
      const errors = validateData({
        document: { nested: { foo: "bar" } },
        model,
        mutatorName: "create",
      });
      expect(errors).toHaveLength(0);

      const updateErrors = validateData({
        document: { nested: { foo: "bar" } },
        model,
        mutatorName: "update",
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
      const errors = validateData({
        document: { array: [1, 2, 3] },
        model,
        mutatorName: "create",
      });
      expect(errors).toHaveLength(0);

      const updateErrors = validateData({
        document: { array: [1, 2, 3] },
        model,
        mutatorName: "update",
      });
      expect(updateErrors).toHaveLength(0);
    });
  });
});
