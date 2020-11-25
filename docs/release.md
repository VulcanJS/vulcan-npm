# Release

Work in progress

## Solve "error Package marked as private, not publishing."

Make packages public by adding this config in every public package:

```
 "publishConfig": {
    "access": "public"
  }
```

## Script

```sh
# Merge potential hotfixes
git checkout master && git pull && git checkout devel && git pull
# Clear all node_modules
yarn clean
# Reinstall to get a fresh version (takes a while)
yarn
# Build
yarn build
# Unit test
yarn test
# Deploy (Lerna will prompt questions for versionning)
# NOTE: "yarn publish" already has a meaning so we can't override it, we need to call "yarn lerna publish"
 # NOTE: directly calling learn publish might publish only changed package, but change detection is not always reliable
 # so we may use force publish
yarn lerna publish # --force-publish
# Changelog update
yarn run auto-changelog
git commit -am "bump version"
git push
git push --tags
```
