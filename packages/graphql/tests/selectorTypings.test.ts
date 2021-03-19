import { VulcanSelector } from "../typings";

describe("vulcan/graphql/selector typings", () => {
  test("basic selectors are working ok", () => {
    const sampleFieldSelector: VulcanSelector = {
      foo: 2,
    };
    const sampleFieldAndConditionSelector: VulcanSelector = {
      foo: { _gt: 2, _gte: 3 },
    };
  });
  test("selector with operators", () => {
    const sampleOperatorSelector: VulcanSelector = {
      _or: [{ foo: 2 }, { bar: 3 }],
    };
    const sampleOperatorConditionSelector: VulcanSelector = {
      _or: [{ foo: 2 }, { bar: { _gt: 3 } }],
    };
  });
  test("works with a generic", () => {
    const sampleFieldAndConditionSelectorWithModel: VulcanSelector<{
      bar: number;
    }> = { bar: 2, foo: 3 };
  });
});
