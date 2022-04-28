# Contributing

## Read the Readme

Start by reading the Readme for basic install information.

Then, the package.json list the typical commands you'd expect from an NPM library: build, test...

## Recommended: use Jest and Storybook to test your code

When adding feature to Vulcan Next or fixing bug, you'll want to run your code to test it.

- For components, you can run Storybook: `yarn run storybook`. Stories let you render components in a certain state, and even automate some operations on them using the "play" function. Documentation: https://storybook.js.org/
- For code, you can run unit tests with Jest: `yarn run test` or `yarn run test <your-test-file-name>`.
- For graphql operations, check `test/integration` folder: you can run a full Vulcan backend, similar to the backend running in Vulcan Next.
You can even use an in-memory Mongo database.

## Advanced: plug to another application

Using your local Vulcan NPM install within another local application, usually based on Vulcan Next, requires "linking".
Linking means that instead of using the package from NPM, you'll tell your application to use the local version of the package.
Linking is quite complex (see https://github.com/VulcanJS/vulcan-next/issues/104) so we use [Yalc](https://github.com/wclr/yalc) to simplify
it as much as possible.

To sum it up:

- In Vulcan NPM, `yarn run build && yarn run publish:local` will publish all packages in the local Yalc registry
- In your application, `yalc link @vulcanjs/graphql` will get the package from this local registry. 
The command `yarn run link:vulcan` will do this for all @vulcanjs packages
- When you update code in Vulcan NPM, rerun `yarn run build && yarn run publish:local`. Your app will automatically reload with the new version.

A similar documentation exists in Vulcan Next project.

## Common issues

## No index.d.ts in dist

You may end up with a build folder like this:
```
dist/mongo/...
dist/graphql/...
dist/your-package/...
```
instead of just having your package code.

You mistakenly imported local code from another package, like importing from `../graphql` instead of `@vulcanjs/graphql` in `@vulcanjs/mongo`. Find the culprit import and fix them will repair the build.

If your import are correct and you still have this issue, this also seems to unexpectedly affect "@vulcanjs/mongo/client" (client entrypoint) as well.
In this case, set a false webpack alias for the faulty package (see react-hooks for instance)

## Package self-referencing or leaking server code

If `build:types` refuses to overwrite a file, you might have wrongly imported "dist" in your code ; have a package
that references itself ; or leak some server code in a shared package.

### Forgetting to include tests and stories in tsconfig.json

This is necessary to get the right typings in VS code. If you ever need to exclude them, eg to fasten the build, then create a dedicated `tsconfig.build.json` for instance and live `tsconfig.json` alone.

See [this long standing VS code ticket](https://github.com/microsoft/vscode/issues/12463)/

If you want to specifiy the files to include in the build, look at `tsconfig.build.json` instead. This is the file that will actually be used by `ts-loader`.

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