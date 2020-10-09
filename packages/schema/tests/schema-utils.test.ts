import {
  getCreateableFields,
  getReadableFields,
  getUpdateableFields,
  getValidFields,
} from "../schema-utils";

describe("schema/schema-utils", () => {
  describe("fields extraction", function () {
    describe("valid", function () {
      test("remove invalid fields", function () {
        const schema = {
          validField: {},
          arrayField: {},
          // array child
          "arrayField.$": {},
        };
        expect(getValidFields(schema)).toEqual(["validField", "arrayField"]);
      });
    });
    describe("readable", function () {
      test("get readable field", function () {
        const schema = {
          readable: { canRead: [] },
          notReadble: {},
        };
        expect(getReadableFields(schema)).toEqual(["readable"]);
      });
    });
    describe("creatable", function () {
      test("get creatable field", function () {
        const schema = {
          creatable: { canCreate: [] },
          notCreatable: {},
        };
        expect(getCreateableFields(schema)).toEqual(["creatable"]);
      });
    });
    describe("updatable", function () {
      test("get updatable field", function () {
        const schema = {
          updatable: { canUpdate: [] },
          notUpdatable: {},
        };
        expect(getUpdateableFields(schema)).toEqual(["updatable"]);
      });
    });
  });
});
