# Contributing

## Read the Readme

Start by reading the Readme for basic install information.

## Lerna

### Yarn workspaces

Yarn workspaces allow to share dependencies between packages. This is especially useful for dev dependencies such as Jest.

They are equivalent to using NPM + Lerne "Hoist" feature.

https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/

### Common issues

#### TypeScript syntax not recknognized in end-application

You are importing non built code directly. Example:

```sh
error - /code/vulcan-npm/packages/next-material-ui/components/Link.tsx 10:5
Module parse failed: Unexpected token (10:5)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
| import MuiLink, { LinkProps as MuiLinkProps } from "@material-ui/core/Link";
|
> type LinkProps = NextLinkProps &
|   MuiLinkProps & {
|     activeClassName?: string;

```

You either forgot to call `yarn build` or did a direct import (`import foobar from "@vulcanjs/reac-hooks/some-not-built-file")`.

#### Code not updating during test

Don't forget to build the code.
If you write a test for package "React Hooks", and discover and fix a bug in package "GraphQL", you'll need to rebuild the "GraphQL" package to get the freshest version.

#### Weird behaviour when linking with React, Apollo, Mongoose.

Define Peer Dependencies correctly. Many packages have side effects that are problematic if you duplicate them. Those packages should be
peer-dependencies in the relevant `package.json`. You may add them at the root of the project too in development.

Also, use Yalc to install local version of Vulcan NPM within another local app, see the README for more information.

##### Example with Mongoose

###### Make it a peer dependency

In `packages/mongo/package.json`:

```
peerDependencies: {
    mongoose: "> 5"
}
```

The end application will have only 1 version of Mongoose thanks to this.
In `./package.json`:

```
devDependencies: {
    "mongoose": "^5.10.16"
}
```