import {
  buildDefaultMutationResolvers
} from "../resolvers/defaultMutationResolvers";

describe("graphql/mutation resolvers", function () {
  test("returns mutations", function () {
    const mutations = buildDefaultMutationResolvers({
      typeName: "Foo",
      options: {},
    });
    expect(mutations.create).toBeDefined();
    expect(mutations.update).toBeDefined();
    expect(mutations.delete).toBeDefined();
  });
});
