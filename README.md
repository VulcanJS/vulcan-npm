# Vulcan NPM

## What is Vuclan

Vulcan is an open source full-stack JavaScript toolkit.

It brings everything you need to create modern web applications on top of modern frameworks.

This monorepo is where all the development happens. Only contributor should need to clone it, if you want
to create an app with Vulcan:

- discover [Vulcan Next](https://vulcan-next.vercel.app/), the Next.js and GraphQL starter app based on Vulcan NPM package library.
- Or you might prefer our [Remix "Eurodance" stack](https://eurodance-stack.vercel.app/).

See Vulcan docs for detailed documentation: [https://vulcan-docs.vercel.app/](https://vulcan-docs.vercel.app/)

## Contribute

After you've read the README, also check [the contribution documentation](https://vulcan-docs.vercel.app/docs/core/contribute) for more information about contributions.

### Architecture of the monorepo

- Turborepo to run scripts efficiently
- Yarn 3 workspaces
- TypeScript
- Tsup (Esbuild + Rollup) for bundling packages
- Packages in `packages` and starter apps in `starters`
- Storybook
- Jest client and server tests
- Docusaurus documentation

### From Lerna to Yarn 2

RIP [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Lerna is officially deprecated. Instead we are progressively replacing it with Yarn 2 workspaces.

- Install Yarn 2+: https://yarnpkg.com/getting-started/install

```
# 1. Install Node 16.10+, then:
corepack enable
yarn set version stable
```

Plugins are already installed, since some parts of the ".yarn" folder are stored in the repo (Yarn executable, plugins etc.)

- We replace Lerna commands either by "yarn workspace" or "lerna-lite" commands
- Use "\*" as the version dependency to force Yarn to install local versions when the package is not yet published: https://blog.charlesloubao.com/one-line-javascript-tip-1-how-to-install-a-local/
- If necessary, go back to "classic" with "yarn set classic"

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
- [Lee Robinson (Vercel) take on monorepo](https://leerob.io/blog/turborepo-design-system-monorepo)

---

[![Powered by Vercel](https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg)](https://vercel.com?utm_source=vulcan&utm_campaign=oss)