import { createModel } from "@vulcanjs/model";
import { getLabel } from "../fields";

describe("react-components/components/Form - Fields", () => {
  describe("getLabel", () => {
    const contextWithI18n = {
      formatMessage: (m) => m,
    };
    const context = {
      formatMessage: () => "", // key not found, will fallback to label or name
    };
    test("internationalize label if possible", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          attr1: {
            type: String,
          },
        },
      });
      const label = getLabel(model, model.schema, contextWithI18n, "attr1");
      expect(label).toEqual({ id: "foo.attr1" });
    });
    test("use explicit field label if set", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          attr1: {
            type: String,
            label: "Hello World",
          },
        },
      });
      const label = getLabel(model, model.schema, context, "attr1");
      expect(label).toEqual("Hello World");
    });
    test("fallback to field name as label", () => {
      const model = createModel({
        name: "Foo",
        schema: {
          attr1: {
            type: String,
          },
        },
      });
      const label = getLabel(model, model.schema, context, "attr1");
      expect(label).toEqual("Attr1");
    });
  });
});
