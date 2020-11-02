import { buildDefaultQueryResolvers } from "../resolvers/defaultQueryResolvers";
import extendModel from "../../extendModel";
import { createModel } from "@vulcanjs/model";
import { VulcanGraphqlModel } from "../../typings";
import { Connector } from "../resolvers/typings";
import merge from "lodash/merge";

describe("graphql/query resolvers", function () {
  const createDummyModel = (schema, options = {}) =>
    createModel({
      name: "Dummy",
      schema,
      ...options,
      extensions: [
        extendModel({ typeName: "Dummy", multiTypeName: "Dummies" }),
      ],
    }) as VulcanGraphqlModel;
  const Dummy = createDummyModel({
    _id: {
      type: String,
      canRead: ["admin"],
    },
  });
  const resolversOptions = {
    typeName: "Dummy",
    options: {},
  };
  const adminUser = { _id: "foobar", groups: [], isAdmin: true };
  const loggedInUser = { _id: "foobar", groups: [], isAdmin: false };
  const defaultContext = {
    currentUser: adminUser,
    Dummy: {
      model: Dummy,
    },
  };
  const defaultConnector: Partial<Connector> = {
    filter: () => ({ selector: {}, options: {}, filteredFields: [] }),
  };
  // TODO: what's the name of this argument? handles cache
  const lastArg = { cacheControl: {} };
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-unused-vars
  const getSingleResolver = () =>
    buildDefaultQueryResolvers(resolversOptions).single.resolver;
  const getMultiResolver = () =>
    buildDefaultQueryResolvers(resolversOptions).multi.resolver;

  describe("single", function () {
    test("defines the correct fields", function () {
      const { single } = buildDefaultQueryResolvers(resolversOptions);
      const { description, resolver } = single;
      expect(description).toBeDefined();
      expect(resolver).toBeDefined();
      expect(resolver).toBeInstanceOf(Function);
    });
    test("return document in case of success", async () => {
      const resolver = getSingleResolver();
      const documentId = "my-document";
      const document = { _id: documentId };
      const input = { selector: { documentId } };
      // non empty db
      const context = merge(defaultContext, {
        Dummy: {
          connector: { ...defaultConnector, findOne: async () => document },
        },
      });
      const res = await resolver(null, { input }, context, lastArg);
      return expect(res).toEqual({ result: document });
    });

    // TODO: the current behaviour is not consistent, could be improved
    // @see https://github.com/VulcanJS/Vulcan/issues/2118
    test.skip("return null if documentId is undefined in selector", function () {
      const resolver = getSingleResolver();
      // no documentId
      const input = { selector: {} };
      // non empty db
      const context = merge(defaultContext, {
        Dummy: {
          connector: {
            findOne: async () => ({ _id: "my-document" }),
          },
        },
      });
      const res = resolver(null, { input }, context, lastArg);
      return expect(res).resolves.toEqual({ result: null });
    });
    it("return null if failure to find doc but allowNull is true", async () => {
      const resolver = getSingleResolver();
      const documentId = "bad-document";
      const input = { selector: { documentId }, allowNull: true };
      // empty db
      const context = merge(defaultContext, {
        Dummy: {
          connector: { ...defaultConnector, findOne: async () => null },
        },
      });
      const res = await resolver(null, { input }, context, lastArg);
      return expect(res).toEqual({ result: null });
    });
    test("throws if documentId is defined but does not match any document", async () => {
      const resolver = getSingleResolver();
      const documentId = "bad-document";
      const input = { selector: { documentId } };
      // empty db
      const context = merge(defaultContext, {
        Dummy: {
          connector: { filter: () => ({}) },
        },
      });
      await expect(
        resolver(null, { input }, context, lastArg)
      ).rejects.toThrow();
    });
    /*
    TODO: we should focus on testing the canFilterDocument method instead
    describe("filtering", () => {
      const schema = {
        adminOnlyField: {
          type: String,
          canRead: ["admins"],
        },
        year: {
          type: Number,
          canRead: "owners",
        },
        userId: {
          type: String,
          canRead: ["guests"],
        },
      };
      const Dummy = createDummyModel(schema);
      const resolverOptions = {
        model: Dummy,
        options: {},
      };
      const getSingleResolver = () =>
        buildDefaultQueryResolvers(resolversOptions).single.resolver;
      test("throws if filtering on field never readable by user, whatever the document is", () => {
        const resolver = getSingleResolver();
        const filter = {
          adminOnyField: { _gte: "hello" },
        };
        const input = { selector: {}, filter, allowNull: true };
        const doc = { userId: "1", year: 3 };
        // empty db
        const context = {
          ...defaultContext,
          Dummy: {
            connector: {
              ...defaultConnector,
              findOne: async () => doc,
              findOneById: async () => doc,
            },
          },
          currentUser: { _id: "2" }, // a non admin user
        };
        return expect(
          resolver(null, { input }, context, lastArg)
        ).rejects.toThrow();
      });
      test("return null if filtering on field readable by owners but user is not owner", () => {
        const resolver = getSingleResolver();
        const filter = {
          year: { _gte: 1, _lte: 5 },
        };
        const input = { selector: {}, filter, allowNull: true };
        const doc = { userId: "1", year: 3 };
        // empty db
        const context = {
          ...defaultContext,
          Dummy: {
            connector: {
              ...defaultConnector,
              findOneById: async () => doc, // load is used when using _id
              findOne: async () => doc, // get is used with custom selectors => uses findOne under the hood
            },
          },
          currentUser: { _id: "2" },
        };
        return expect(
          resolver(null, { input }, context, lastArg)
        ).resolves.toEqual({ result: null });
      });
      test("return doc if filtering on field readable by owners and user is owner", () => {
        const resolver = getSingleResolver();
        const filter = {
          year: { _gte: 1, _lte: 5 },
        };
        const input = { selector: {}, filter };
        const doc = { userId: "1", year: 3 };
        // empty db
        const context = {
          ...defaultContext,
          Dummy: {
            connector: {
              ...defaultConnector,
              findOneById: async () => doc, // load is used when using _id
              findOne: async () => doc, // get is used with custom selectors => uses findOne under the hood
            },
          },
          currentUser: { _id: "1" },
        };
        const res = resolver(null, { input }, context, lastArg);
        return expect(res).resolves.toEqual({ result: doc });
      });
    });
    */
  });

  /*
  describe("multi", () => {
    test("defines the correct fields", function () {
      const { multi } = buildDefaultQueryResolvers(resolversOptions);
      const { description, resolver } = multi;
      expect(description).toBeDefined();
      expect(resolver).toBeDefined();
      expect(resolver).toBeInstanceOf(Function);
    });
    test("get documents", () => {
      const resolver = getMultiResolver();
      const dbDocuments = [
        {
          _id: "1",
        },
        {
          _id: "2",
        },
      ];
      const input = { terms: {} };
      // non empty db
      const context = {
        ...defaultContext,
        Dummy: {
          connector: {
            ...defaultConnector,
            count: async () => dbDocuments.length,
            find: async () => dbDocuments,
          },
        },
        currentUser: adminUser,
      };
      const res = resolver(null, { input }, context, lastArg);
      return expect(res).resolves.toMatchObject({ results: dbDocuments });
    });
    describe("security", () => {
      test("filter out unallowed documents", () => {
        const doc2 = { _id: "2" };
        const dbDocuments = [
          {
            _id: "1",
          },
          doc2,
        ];
        const input = { terms: {} };
        const Dummy = createDummyModel(
          {
            _id: { type: String, canRead: ["admins"] },
          },
          {
            permissions: {
              canRead: ({ document: { _id } }) => _id !== "1", // filter out first document
            },
          }
        );
        const resolver = buildDefaultQueryResolvers({
          model: Dummy,
          options: {},
        }).multi.resolver;
        const context = {
          ...defaultContext,
          // non empty db
          Dummy: {
            connector: {
              find: async () => dbDocuments,
            },
          },
        };
        const res = resolver(null, { input }, context, lastArg);
        return expect(res).resolves.toMatchObject({ results: [doc2] });
      });
      test("filter out restricted fields from retrieved documents", () => {
        const resolver = getMultiResolver();
        // foo does not exist in the schema
        const doc1 = { _id: "1", foo: "bar" };
        const doc2 = { _id: "2", foo: "bar" };
        const dbDocuments = [doc1, doc2];
        const input = { terms: {} };
        const context = {
          // non empty db
          Dummy: {
            find: async () => dbDocuments,
          },
        };
        const res = resolver(null, { input }, context, lastArg);
        return expect(res).resolves.toMatchObject({
          results: [{ _id: "1" }, { _id: "2" }],
        });
      });
    });
    // @see https://5da5072ecae7f900081d6d9a--happy-villani-6ca506.netlify.com/
    /*
    describe("user defined filtering", () => {
      // TODO: this is a unit test based on props but an integration test with mongo would be more efficient
      it("filter documents based on user input", async () => {
        const resolver = getMultiResolver();
        const input = {
          filter: { year: { _gte: 2000 } },
        };
        // TODO: creating a spy on find is tedious, use integration test instead
        const findSpy = sinon.spy(() => ({ fetch: () => [], count: () => 0 }));
        const context = buildContext({
          Dummies: createDummyCollection({
            schema: {
              _id: { type: String, canRead: ["admins"] },
              year: { type: Number, canRead: ["admins"] },
            },
            find: findSpy,
          }),
        });
        const res = await resolver(null, { input }, context, lastArg);
        // TODO:
        expect(findSpy.getCall(0).args[0]).toMatchObject({
          year: { $gte: 2000 },
        });
      });
      // TODO: API changed, this test is not valid anymore
      it.skip("detect invalid filters", async () => {
        const resolver = getMultiResolver();
        const input = {
          // gte is not valid, _gte is correct
          filter: { year: { gte: 2000 } },
        };
        // TODO: creating a spy on find is tedious, use integration test instead
        const findSpy = sinon.spy(() => ({ fetch: () => [], count: () => 0 }));
        const context = buildContext({
          Dummies: createDummyCollection({
            schema: {
              _id: { type: String, canRead: ["guests"] },
              year: { type: Number, canRead: ["guests"] },
            },
            find: findSpy,
          }),
        });
        await expect(
          resolver(null, { input }, context, lastArg)
        ).rejects.toThrow();
      });
      // important to avoid indirect access to the value (filtering is indirectly equivalent to reading)
      it("throw if field in filter is never-readable", async () => {
        const resolver = getMultiResolver();
        const input = {
          filter: { year: { _gte: 2000 } },
        };
        const findSpy = sinon.spy(() => ({ fetch: () => [], count: () => 0 }));
        const context = buildContext({
          Dummies: createDummyCollection({
            schema: {
              _id: { type: String, canRead: ["admins", "members"] },
              year: { type: Number, canRead: ["admins"] },
            },
            find: findSpy,
          }),
          currentUser: loggedInUser, // not an admin so can't filter on year,
        });
        await expect(
          resolver(null, { input }, context, lastArg)
        ).rejects.toThrow();
      });
      it("apply document based canRead functions to filtered documents", () => {
        const resolver = getMultiResolver();
        const doc1 = { userId: "1", year: 3 };
        const doc2 = { userId: "2", year: 3 }; // filter is applied to year, but user cannot read the year of this document because he is not owner
        const filter = {
          year: { _gte: 1, _lte: 5 },
        };
        const input = { selector: {}, filter };
        // empty db
        const context = buildContext({
          Dummies: createDummyCollection({
            schema: {
              year: {
                type: Number,
                canRead: "owners",
              },
              userId: {
                type: String,
                canRead: ["guests"],
              },
            },
            results: {
              find: [doc1, doc2],
            },
          }),
          currentUser: { _id: "1" },
        });
        return expect(
          resolver(null, { input }, context, lastArg)
        ).resolves.toEqual({ results: [doc1] });
      });
      // seems to work eventually...
      /*
      it('runs integration test', async () => {
        const Foobars = createCollection({
          collectionName: 'Foobars',
          typeName: 'Foobar',
          schema: { _id: { type: String, canRead: ['admins'] } }
        })
        await Foobars.insert({ _id: '1' })
        const res = await Foobars.find().fetch()
        console.log(res)
        await Foobars.rawCollection().drop()
      })
    });
  });
      */
});
