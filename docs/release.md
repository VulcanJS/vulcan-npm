# Release

Work in progress

Make packages public by adding this config in every publick package:

```
 "publishConfig": {
    "access": "public"
  }
```

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
yarn publish
```
