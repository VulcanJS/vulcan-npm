import SimpleSchema from "simpl-schema";
import { getFieldTypeName, getFieldType } from "../simpleSchema-utils";
describe("schema/simpleSchema-utils", () => {
  describe("getFieldType/TypeName", () => {
    test("string", () => {
      const schema = new SimpleSchema({
        foo: {
          type: String,
        },
      })._schema;
      const field = schema["foo"];
      const fieldType = getFieldType(field);
      const fieldTypeName = getFieldTypeName(fieldType);
      expect(fieldTypeName).toEqual("String");
    });
  });
});
