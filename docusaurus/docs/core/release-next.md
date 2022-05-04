# Release process

## Create a release branch

```sh
# No need to clean node_modules, yarn will do it for you on install
# rm -Rf node_modules
yarn install # no missing module surprise
yarn upgrade:vulcan # update versions to latest Vulcan NPM release
# yarn up # Optionnaly upgrade all packages to latest version (may produce breaking changes!)
```

## Run the app, run tests

```sh
yarn run typecheck
yarn run lint
```

```sh
# Run mongo in a separate shell
yarn run start:mongo
```

```sh

### Test process
# Fix any problem that occur during those tests
# Check devel run
yarn run dev
```

```sh
# Check production run
yarn run build
yarn run start # test the production app
```

```sh
# Check static build and run
# Next Export is now disabled (11/2021, Next 12), we prefer Automatic Static Optimization.
# @see https://github.com/VulcanJS/vulcan-next/issues/98
# yarn run build:static && yarn run start:static
# Run tests
yarn run test
# Run tests specific to Vulcan Next (longer)
yarn run test:vn
# Test storybook
yarn run storybook
# Test storybook static build
yarn run build:storybook && yarn run start:storybook-static # test storybook  static export
# Update Chromatic
yarn run chromatic

# Optionnaly test Docker version (takes a lot of time + not very useful as they don't change often)
# yarn run build:docker
# yarn run build:test:docker
# yarn run start:docker
# yarn run test:docker
```

```sh
### Changelog (versionning is handled at repo level)
yarn run auto-changelog # update changelog
git commit -am "bump next version"
```

## Deploy

```sh

### Deploy
git checkout main && git merge release/<next-version>
git push

### Update devel branches with fixes
git checkout develop && git pull && git merge main && git push

```
