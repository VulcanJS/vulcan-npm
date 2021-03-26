import { VulcanSelector } from "../typings";

describe("vulcan/graphql/selector typings", () => {
  test("basic selectors are working ok", () => {
    const sampleFieldSelector: VulcanSelector = {
      foo: { _eq: 2 },
    };
    const sampleFieldAndConditionSelector: VulcanSelector = {
      foo: { _gt: 2, _gte: 3 },
    };
  });
  test("selector with operators", () => {
    const sampleOperatorSelector: VulcanSelector = {
      _or: [{ foo: { _eq: 2 } }, { bar: { _eq: 3 } }],
    };
    const sampleOperatorConditionSelector: VulcanSelector = {
      _or: [{ foo: { _eq: 2 } }, { bar: { _gt: 3 } }],
    };
  });
  test("works with a generic", () => {
    const sampleFieldAndConditionSelectorWithModel: VulcanSelector<{
      bar: number;
    }> = { bar: { _eq: 2 } /*, foo: 3 */ };
  });
  test.skip("works with native values", () => {
    // Currently you have to write bar: { _eq: 2}, you cannot write { bar: 2}
    /*
    const sampleFieldAndConditionSelectorWithModel: VulcanSelector<{
      bar: number;
    }> = { bar: 2 };
    */
  });
});
