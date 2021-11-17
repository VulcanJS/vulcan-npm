module.exports = {
  entryPoints: [
    // don't forget to list twice packages that have a server/client/common export
    "packages/graphql/index.ts",
    "packages/graphql/server/index.ts",
    "packages/i18n/index.ts",
    "packages/mdx/index.ts",
    "packages/meteor-legacy/index.ts",
    "packages/model/index.ts",
    "packages/mongo/index.ts",
    "packages/mongo/client/index.ts",
    "packages/permissions/index.ts",
    "packages/react-hooks/index.ts",
    "packages/react-ui/index.ts",
    "packages/schema/index.ts",
    "packages/utils/index.ts",
  ],
  out: "generated/docs",
};
