# Vulcan NPM

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)


## Contribute

Discover [Vulcan Next](https://github.com/VulcanJS/vulcan-next), the Next.js and GraphQL starter app based on Vulcan NPM package library.

After you've read the README, also check `./CONTRIBUTE.md` for more information about contributions.

See Vulcan Next for detailed documentation: [https://github.com/VulcanJS/vulcan-next](https://github.com/VulcanJS/vulcan-next)

## Install Vulcan NPM and start coding

Please use [Yarn](https://yarnpkg.com/)

```sh
yarn # will install + bootstrap learn
yarn run build # build all packages
```

Now you can either run Storybook `yarn run storybook` or unit tests `yarn run test` and start working.

## Plug to another local application

If you want to connect your local Vulcan NPM install to an existing application, please check [Vulcan Next documentation](https://vulcan-docs/docs/vulcan-next/contribute).

It's a 2 step process:

- you publish the packages locally using Yalc `yarn run publish:local` 
- you install them, using Yalc, in your app.

We use Yalc and not `yarn link` because linking is not sufficient, it raises a lot of issues with locally installed packages.

Now `@vulcanjs/xxx` will be available in your own application.

## Windows

To use a testing database on windows, you could encounter an unexpected issue ; a solution is to download Visual C++ redistribuable.
See https://github.com/nodkz/mongodb-memory-server/issues/475

## Resources

- [Babel monorepo](https://github.com/babel/babel), a great example of Lerna project
