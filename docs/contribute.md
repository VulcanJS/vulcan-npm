## Lerna

### Install

```sh
# Will install all NPM packages
# It uses yarn workspaces to avoid redundancy
lerna bootstrap
```

#### Use in another local package

In `vulcan-npm`, link all your packages:

```js
yarn lerna exec yarn link
```

In your app, link packages:

```sh
# USE YARN, it won't work with npm
yarn link @vulcan/model
yarn link @vulcan/schema
...
# NOTE: we don't yet have a way to link everything
```

### Yarn workspaces

Yarn workspaces allow to share dependencies between packages. This is especially useful for dev dependencies such as Jest.

They are equivalent to using NPM + Lerne "Hoist" feature.

https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/
