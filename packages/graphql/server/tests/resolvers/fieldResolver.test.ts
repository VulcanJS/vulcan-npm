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
    permissions: {
      canRead: ["admins", "members"],
    },
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
          resolver: async (root, args, context) => {
            return `Variable value is ${args?.variable}`;
          },
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
    const GET_FOO = `query getFoo($variable: String) {
          foo(input:{}) {
            result {
              field
              resolvedField(variable: $variable)
            }
          } 
        }`;
    const result = await server.executeOperation({
      query: GET_FOO,
      variables: { variable: "world" },
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.foo?.result).toEqual({
      // TODO: not sure if it should be null or undefined
      field: null,
      resolvedField: null,
    });

    currentUser.isAdmin = true;
    const resultAdmin = await server.executeOperation({
      query: GET_FOO,
      variables: { variable: "world" },
    });
    expect(resultAdmin.errors).toBeUndefined();
    expect(resultAdmin.data?.foo?.result).toEqual({
      field: "fieldValue",
      resolvedField: "Variable value is world",
    });
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
