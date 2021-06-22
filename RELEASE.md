# Release

Work in progress

## Solve "error Package marked as private, not publishing."

Make packages public by adding this config in every public package:

```json
 "publishConfig": {
    "access": "public"
  }
```

## Script

```sh
# Merge potential hotfixes
git checkout master && git pull && git checkout devel && git pull && git merge master && git merge devel
# Check missing dependencies (NOTE: there might be false positive and false negative, be careful! Don't remove too many "unused" packages!)
# - Ignore dependencies to storybook or jest (handled at the root level)
# - Beware of things that should stay peer deps, like React
# - Ignore dependencies that should disappear (work in progress)
yarn run depcheck
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

## Simpler script

If you want to trigger a release quickly without manually checking deps or whatever, you can simply run the Github workflow locally:

```sh
git checkout master && git pull && git checkout devel && git pull && git merge master && git merge devel
# yarn add -g act # @see https://github.com/nektos/act
act # this will run the same steps as the release basically
yarn lerna publish # --force-publish
# Changelog update
yarn run auto-changelog
git commit -am "bump version"
git push
git push --tags
```
