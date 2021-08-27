import { createGraphqlModel } from "../../extendModel";
import { hasMany, hasOne } from "../resolvers/relationResolvers";
import merge from "lodash/merge";

const authorModel = createGraphqlModel({
  name: "Author",
  graphql: {
    typeName: "Author",
    multiTypeName: "Authors",
  },
  schema: {
    blogPostIds: {
      type: Array,
      canRead: ["guests"],
    },
    "blogPostIds.$": {
      type: String,
    },
  },
});
const blogPostModel = createGraphqlModel({
  name: "BlogPosts",
  graphql: {
    typeName: "BlogPost",
    multiTypeName: "BlogPosts",
  },
  schema: {
    _id: {
      type: String,
      canRead: ["guests"],
    },
    title: {
      type: String,
      canRead: ["guests"],
    },
    privateInfo: {
      type: String,
      canRead: ["admins"],
    },
  },
});
const initHasManyParams = () => ({
  fieldName: "blogPostIds",
  relation: {
    fieldName: "blogPosts",
    kind: "hasMany" as const,
    typeName: "BlogPost",
  },
});
const initContext = (passedContext = {}) =>
  merge(
    {},
    {
      BlogPost: {
        connector: {
          _filter: jest.fn(() => ({ selector: null })),
          find: jest.fn(() => []),
        },
        model: blogPostModel,
      },
    },
    passedContext
  );
describe("hasMany", () => {
  test("get related documents", async () => {
    const manyResolver = hasMany(initHasManyParams());
    const author = { blogPostIds: ["1"] };
    const posts = [{ _id: "1", title: "1" }];
    // NOTE: an integration test would be more useful for this basic scenario
    const res = await manyResolver(author, null, {
      ...initContext({
        BlogPost: { connector: { find: jest.fn(() => posts) } },
      }),
    });
    expect(res).toEqual(posts);
  });
  test("remove unallowed fields", async () => {
    const manyResolver = hasMany(initHasManyParams());
    const author = { blogPostIds: ["1"] };
    const posts = [{ _id: "1", title: "1", privateInfo: "PRIVATE" }];
    const res = await manyResolver(author, null, {
      ...initContext({
        BlogPost: { connector: { find: jest.fn(() => posts) } },
      }),
    });
    expect(res).toEqual([{ _id: "1", title: "1" }]);
  });
  test.skip("remove unallowed documents", () => {});
});
