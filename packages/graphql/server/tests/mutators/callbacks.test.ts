import { createModel } from "@vulcanjs/model";
import extendModel from "../../../extendModel";
import { VulcanGraphqlModel } from "../../../typings";
import { createMutator } from "../../resolvers/mutators";
import { Connector } from "../../resolvers/typings";
import merge from "lodash/merge";

const schema = {
  _id: {
    type: String,
    canRead: ["guests"],
    optional: true,
  },
  foo2: {
    type: String,
    canCreate: ["guests"],
    canRead: ["guests"],
    canUpdate: ["guests"],
  },
};
const Foo = createModel({
  schema,
  name: "Foo",
  extensions: [extendModel({ typeName: "Foo", multiTypeName: "Foos" })],
}) as VulcanGraphqlModel;
describe("graphql/resolvers/mutators callbacks", function () {
  describe("create callbacks", () => {
    // create fake context
    const defaultPartialContext: {
      Foo: { connector: Partial<Connector> };
    } = {
      Foo: {
        connector: {
          create: async () => "1", // returns the new doc id
          findOneById: async () => ({
            id: "1",
          }),
          findOne: async () => ({ id: "1" }),
          update: async () => ({ id: "1" }),
        },
      },
    };
    const defaultArgs = {
      model: Foo,
      document: { foo2: "bar" },
      validate: false,
      // we test while being logged out
      asAdmin: false,
      currentUser: null,
    };
    const createArgs = {
      ...defaultArgs,
    };
    // before
    test.skip("run before callback before document is saved", function () {
      // TODO get the document in the database
    });
    //after
    test("run after callback before document is returned", async function () {
      const after1 = jest.fn((doc) => ({ ...doc, after1: 1 }));
      const after2 = jest.fn((doc) => ({ ...doc, after2: 2 }));
      const Foo = createModel({
        schema,
        name: "Foo",
        extensions: [
          extendModel({
            typeName: "Foo",
            multiTypeName: "Foos",
            callbacks: {
              create: {
                after: [after1, after2],
              },
            },
          }),
        ],
      }) as VulcanGraphqlModel;
      const context = merge(defaultPartialContext, { Foo: { model: Foo } });
      const { data: resultDocument } = await createMutator({
        ...createArgs,
        model: Foo,
        context,
        data: { foo2: "bar" },
      });
      expect(after1).toHaveBeenCalledTimes(1);
      expect(after2).toHaveBeenCalledTimes(1);
      // expect(resultDocument.after1).toBe(1);
      // expect(resultDocument.after2).toBe(2);
    });
    /*
      // async
      test("run async callback", async function () {
        // TODO need a sinon stub
        const asyncSpy = sinon.spy();
        addCallback("foo2.create.async", (properties) => {
          asyncSpy(properties);
          // TODO need a sinon stub
          //expect(originalData.after).toBeUndefined()
        });
        const { data: resultDocument } = await createMutator({
          ...createArgs,
          document: { foo2: "bar" },
        });
        expect(asyncSpy.calledOnce).toBe(true);
      });
      test.skip("provide initial data to async callbacks", async function () {
        const asyncSpy = sinon.spy();
        addCallback("foo2.create.after", (document) => {
          document.after = true;
          return document;
        });
        addCallback("foo2.create.async", (properties) => {
          asyncSpy(properties);
          // TODO need a sinon stub
          //expect(originalData.after).toBeUndefined()
        });
        const { data: resultDocument } = await createMutator({
          ...createArgs,
          document: { foo2: "bar" },
        });
        expect(asyncSpy.calledOnce).toBe(true);
        // TODO: check result
      });
   
      test("should run createMutator", async function () {
        const { data: resultDocument } = await createMutator(defaultArgs);
        expect(resultDocument).toBeDefined();
      });
      // before
      test.skip("run before callback before document is saved", function () {
        // TODO get the document in the database
      });
      //after
      test("run after callback  before document is returned", async function () {
        const afterSpy = sinon.spy();
        addCallback("foo2.create.after", (document) => {
          afterSpy();
          document.after = true;
          return document;
        });
        const { data: resultDocument } = await createMutator(defaultArgs);
        expect(afterSpy.calledOnce).toBe(true);
        expect(resultDocument.after).toBe(true);
      });
      // async
      test("run async callback", async function () {
        // TODO need a sinon stub
        const asyncSpy = sinon.spy();
        addCallback("foo2.create.async", (properties) => {
          asyncSpy(properties);
          // TODO need a sinon stub
          //expect(originalData.after).toBeUndefined()
        });
        const { data: resultDocument } = await createMutator(defaultArgs);
        expect(asyncSpy.calledOnce).toBe(true);
      });
      test.skip("provide initial data to async callbacks", async function () {
        const asyncSpy = sinon.spy();
        addCallback("foo2.create.after", (document) => {
          document.after = true;
          return document;
        });
        addCallback("foo2.create.async", (properties) => {
          asyncSpy(properties);
          // TODO need a sinon stub
          //expect(originalData.after).toBeUndefined()
        });
        const { data: resultDocument } = await createMutator(defaultArgs);
        expect(asyncSpy.calledOnce).toBe(true);
        // TODO: check result
      });
    */
  });
});
