/**
 * Test automatic graphql schema generation
 * (= type definitions)
 */
import { createModel } from "@vulcanjs/model";

import extendModel, { createGraphqlModel } from "../../../extendModel";
import { VulcanGraphqlModel } from "../../../typings";
import { parseAllModels } from "../../parseAllModels";
import { buildDefaultQueryResolvers } from "../../resolvers/defaultQueryResolvers";
import { buildDefaultMutationResolvers } from "../../resolvers/defaultMutationResolvers";

describe("graphql/typeDefs", () => {
  describe("parseAllModels", () => {
    const Foo = createGraphqlModel({
      schema: {
        foo: {
          type: String,
          canRead: ["guests"],
          canCreate: ["guests"],
          canUpdate: ["guests"],
        },
      },
      name: "Foo",
      graphql: {
        multiTypeName: "Foos",
        typeName: "Foo",
        queryResolvers: buildDefaultQueryResolvers({ typeName: "Foo" }),
        mutationResolvers: buildDefaultMutationResolvers({ typeName: "Foo" }),
      },
    });
    const Bar = createModel({
      schema: {
        bar: {
          type: String,
          canRead: ["guests"],
          canCreate: ["guests"],
          canUpdate: ["guests"],
        },
      },
      name: "Bar",
      extensions: [
        extendModel({
          multiTypeName: "Bars",
          typeName: "Bar",
          queryResolvers: buildDefaultQueryResolvers({ typeName: "Foo" }),
          mutationResolvers: buildDefaultMutationResolvers({ typeName: "Foo" }),
        }),
      ],
    }) as VulcanGraphqlModel;
    const models = [Foo, Bar];
    test("merge all types in the typeDefs", () => {
      const parsed = parseAllModels(models);
      expect(parsed.typeDefs).toContain("type Foo");
      expect(parsed.typeDefs).toContain("type Bar");
    });
    test("define Query and Mutations", () => {
      const parsed = parseAllModels(models);
      expect(parsed.typeDefs).toMatch("Query {");
      expect(parsed.typeDefs).toContain("foos");
      expect(parsed.typeDefs).toContain("bars");
      expect(parsed.typeDefs).toContain("Mutation {");
      expect(parsed.typeDefs).toContain("createFoo");
      expect(parsed.typeDefs).toContain("createBar");
    });
  });
});
