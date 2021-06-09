# Vulcan NPM

## Contribute

For faster development, you may instead want to contribute to [Vulcan Next Starter](https://github.com/VulcanJS/vulcan-next-starter/issues/1). NPM packages will be published in this repo when they reach sufficient maturity.

After you've read the README, also check `./docs/contribute.md` for more information about contributions.

## Install Vulcan NPM and start coding

Please use [Yarn](https://yarnpkg.com/)

```sh
yarn # will install + bootstrap learn
yarn run build # build all packages
```

Now you can either run Storybook `yarn run storybook` or unit tests `yarn run test` and start working.

## Plug to another local application

If you want to connect your local Vulcan NPM install to an existing application, please check [Vulcan Next documentation](https://github.com/VulcanJS/vulcan-next/blob/devel/src/content/docs/contributing.md).

It's a 2 step process:

- you publish the packages locally using Yalc `yarn run local-publish` 
- you install them, using Yalc, in your app.

We use Yalc and not `yarn link` because linking is not sufficient, it raises a lot of issues with locally installed packages.

Now `@vulcanjs/xxx` will be available in your own application.

## Tips

### Dependency from a local package to another local package

Install packages using `lerna bootstrap`. 

To add a dependency between 2 local Vulcan packages: 

```sh
yarn lerna add @vulcanjs/<your-dependency> --scope=@vulcanjs/<the-parent-package>
```

You need this command because the package won't exist yet on NPMJS, so you need Lerna to manage the dependency.
You can run it from anywhere, and the `--scope` part is mandatory (otherwise the package get added everywhere).

#### Windows

To use a testing database on windows, you could encounter an unexpected issue ; a solution is to download Visual C++ redistribuable.
See https://github.com/nodkz/mongodb-memory-server/issues/475

## Resources

- [Babel monorepo](https://github.com/babel/babel), a great example of Lerna project