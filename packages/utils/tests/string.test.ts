import { capitalize } from "../string";

describe("utils/string", () => {
  test.each([
    ["foo", "Foo"],
    ["Foo", "Foo"],
    ["f", "F"],
    ["F", "F"],
    ["", ""],
    [null, null],
  ])("capitalize %s returns %s", (entry, output) => {
    expect(capitalize(entry)).toEqual(output);
  });
  test("capitalize preserve other latters", () => {
    expect(capitalize("fooBar")).toEqual("FooBar");
    expect(capitalize("FOO")).toEqual("FOO");
  });
});
