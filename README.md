## Contribute

For faster development, you may instead want to contribute to [Vulcan Next Starter](https://github.com/VulcanJS/vulcan-next-starter/issues/1). NPM packages will be published in this repo when they reach sufficient maturity.

### Tips

#### Dependency to a local package

To add a dependency between 2 local vulcan packages: 

```sh
yarn lerna add @vulcanjs/<your-dependency> --scope=@vulcanjs/<the-parent-package>
```

You need this command because the package won't exist yet on NPMJS, so you need Lerna to manage the dependency.
You can run it from anywhere, and the `--scope` part is mandatory (otherwise the package get added everywhere).

### Install

Install Lerna

```
npm i -g lerna
```

### Develop

Install and link packages using `lerna bootstrap`. Now `@vulcanjs/xxx` will be available in your own application.

## Resources

- [Babel monorepo](https://github.com/babel/babel), a great example of Lerna project