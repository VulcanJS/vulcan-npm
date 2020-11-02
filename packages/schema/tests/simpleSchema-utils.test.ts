import {
  getFieldTypeName,
  hasNestedSchema,
  isBlackbox,
} from "../simpleSchema-utils";
describe("schema/simpleSchema-utils", () => {
  describe("getFieldTypeName", () => {
    test.each([
      ["String", String],
      ["Number", Number],
      ["Boolean", Boolean],
      ["Array", Array],
      ["Object", {}],
      ["Date", Date],
    ])("Get typeName for %s", (expectedTypeName, schemaType) => {
      const schema = {
        foo: {
          type: schemaType,
        },
      };
      const field = schema["foo"];
      const fieldTypeName = getFieldTypeName(field);
      expect(fieldTypeName).toEqual(expectedTypeName);
    });
  });
  test("Check if blackbox", () => {
    expect(isBlackbox({ type: String, blackbox: true })).toBe(true);
    expect(isBlackbox({ type: String })).toBe(false);
  });
  test("Check if JSON or nested", () => {
    expect(hasNestedSchema({ type: { foo: { type: "String " } } })).toBe(true);
    // type is Object
    expect(hasNestedSchema({ type: Object })).toBe(false);
    // blackbox is enabled
    expect(
      hasNestedSchema({ type: { foo: { type: "String " } }, blackbox: true })
    ).toBe(false);
    // graphql type is JSON
    expect(
      hasNestedSchema({ type: { foo: { type: "String " } }, typeName: "JSON" })
    ).toBe(false);
  });
});
