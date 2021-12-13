// for resolver testing
import { ApolloServer } from "apollo-server";
import { createGraphqlModelServer } from "../../../extendModel.server";
import { VulcanGraphqlSchemaServer } from "../../../typings";
import { buildApolloSchema } from "../../apolloSchema";
const makeFooModel = (schema: VulcanGraphqlSchemaServer) =>
  createGraphqlModelServer({
    schema,
    name: "Foo",
    graphql: { multiTypeName: "Foos", typeName: "Foo" },
  });
describe("permissions", () => {
  test("field resolver returns null for unauthorized user, and value for authorized", async () => {
    const connector = {
      _filter: jest.fn(() => ({ selector: null, filteredFields: [] })),
      findOne: jest.fn(() => ({
        field: "fieldValue",
      })),
    };
    const model = makeFooModel({
      field: {
        type: String,
        optional: true,
        canRead: ["admins"],
        resolveAs: {
          fieldName: "resolvedField",
          type: "Bar",
          resolver: async (root, { variable }) =>
            `Variable value is ${variable}`,
          arguments: "variable: String",
          description: "Some field",
          typeName: "String",
          addOriginalField: true,
        },
      },
    });
    let currentUser = { isAdmin: false, groups: [] };
    const res = buildApolloSchema([model]);
    // TODO: that's a lot of boilerplate, but running the resolver directly doesn't seem to handle resolved fields
    const server = new ApolloServer({
      typeDefs: res.typeDefs,
      resolvers: res.resolvers,
      context: () => ({
        // we keep currentUser as a mutable variable, so we can change it and test again easily
        currentUser: currentUser,
        userId: "1234",
        Foo: {
          model,
          connector,
        },
      }),
    });
    const result = await server.executeOperation({
      query: `query getFoo {
          foo(input:{}) {
            field
            resolvedField
          } 
        }`,
      variables: { variable: "world" },
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.result).toBe("Ida");
    /*
    const resolvedNotAdmin = await res?.resolvers?.Query?.["foo"](
      { field: "fieldValue" },
      { variable: "world" },
      {
        currentUser: { isAdmin: false, groups: [] },
        userId: "1234",
        Foo: {
          model,
          connector,
        },
      },
      {}
    );
    expect(resolvedNotAdmin).toEqual({ result: {} });
    const resolvedAdmin = await res?.resolvers?.Query?.["foo"](
      { field: "fieldValue" },
      { variable: "world" },
      {
        currentUser: { isAdmin: true, groups: [] },
        userId: "1234",
        Foo: {
          model,
          connector,
        },
      },
      {}
    );

    expect(resolvedAdmin).toEqual({
      result: { field: "fieldValue", resolvedField: "" },
    });*/
  });
});
