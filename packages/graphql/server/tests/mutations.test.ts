import {
  buildDefaultMutationResolvers,
  performMutationCheck,
} from "../resolvers/defaultMutationResolvers";
import expect from "expect";
import { createGraphqlModel } from "../../extendModel";
import { VulcanGraphqlModel } from "../../typings";
const test = it;

describe("graphql/mutation resolvers", function () {
  const Foo = createGraphqlModel({
    name: "Foo",
    schema: { _id: { type: String, canRead: ["admins"] } },
    graphql: { typeName: "Foo", multiTypeName: "Foos" },
    permissions: {
      canCreate: ["members"],
      canUpdate: ["members"],
      canDelete: ["members"],
    },
  }) as VulcanGraphqlModel;
  test("returns mutations", function () {
    const mutations = buildDefaultMutationResolvers({
      typeName: "Foo",
      options: {},
    });
    expect(mutations.create).toBeDefined();
    expect(mutations.update).toBeDefined();
    expect(mutations.delete).toBeDefined();
  });
  describe("performMutationCheck", () => {
    test("throws a 'document not found' error if there is no document", () => {
      expect(() =>
        performMutationCheck({
          model: Foo,
          document: null,
          context: {},
          operationName: "create",
        })
      ).toThrow(
        '[{"id":"app.document_not_found","data":{"operationName":"Foo:create"}}]'
      );
    });
    test("throws an 'operation not allowed' if permission are set but user is not allowed", () => {
      expect(() =>
        performMutationCheck({
          model: Foo,
          document: {},
          context: { currentUser: null },
          operationName: "create",
        })
      ).toThrow(
        '[{"id":"app.operation_not_allowed","data":{"operationName":"Foo:create"}}]'
      );
    });
  });
  /*
  describe("delete mutation", () => {
    const foo = { _id: "foo" };
    const context = {
      Foo: {
        connector: {
          findOne: async () => foo,
        },
      },
      currentUser: {
        isAdmin: true,
        groups: ["admins"],
      },
    };
    const mutations = buildDefaultMutationResolvers({
      model: Foo,
      options: {},
    });
    // We do not need this test anymore because the delete mutator (called by the mutation)
    // will test the selector itself (selector should return a document, otherwise it is ignored)
    //test('refuse deletion if selector is empty', async () => {
    //    const { delete: deleteMutation } = mutations;
    //    const emptySelector = {};
    //    const nullSelector = { documentId: null };
    //    const validIdSelector = { _id: 'foobar' };
    //    const validDocIdSelector = { documentId: 'foobar' };
    //    const validSlugSelector = { slug: 'foobar' };
    //
    //            // const { mutation } = deleteMutation; // won't work because "this" must equal deleteMutation to access "check"
    //            await expect(deleteMutation.mutation(null, { input: { selector: emptySelector } }, context)).rejects.toThrow();
    //            await expect(deleteMutation.mutation(null, { input: { selector: nullSelector } }, context)).rejects.toThrow();
    //
    //            await expect(deleteMutation.mutation(null, { input: { selector: validIdSelector } }, context)).resolves.toEqual({ data: foo });
    //            await expect(deleteMutation.mutation(null, { input: { selector: validDocIdSelector } }, context)).resolves.toEqual({ data: foo });
    //            await expect(deleteMutation.mutation(null, { input: { selector: validSlugSelector } }, context)).resolves.toEqual({ data: foo });
    //        });
  });
  */
});
