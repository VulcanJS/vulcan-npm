import { WebpackPluginInstance, Configuration } from "webpack";

// @see https://www.npmjs.com/package/@storybook/addon-docs
// Manual MD configuration gives us more control on mdx version
// @see https://github.com/storybookjs/storybook/issues/17455
const createCompiler = require("@storybook/addon-docs/mdx-compiler-plugin");

module.exports = {
  core: {
    builder: "webpack5",
  },
  stories: [
    // TODO: reenable progressively, we currently have an issue with build never ending
    "../packages/react-ui/**/*.stories.@(js|jsx|tsx)",
    "../packages/react-ui-lite/**/*.stories.@(js|jsx|tsx)",
    "../packages/react-ui-bootstrap/**/*.stories.@(js|jsx|tsx)",
    // // specifying packages folder is important to avoid rebuilding on cache change
    // // @see https://github.com/storybookjs/storybook/issues/14342
    // "../packages/**/*.stories.mdx",
    //"../packages/**/*.stories.@(js|jsx|ts|tsx)",
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  staticDirs: ["./public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-docs/register",
  ],
  webpackFinal: async (config: Configuration, { configType }) => {
    // Custom MDX setup, because addon-docs is too restrictive
    config.module.rules.push({
      // 2a. Load `.stories.mdx` / `.story.mdx` files as CSF and generate
      //     the docs page from the markdown
      test: /\.(stories|story)\.mdx$/,
      use: [
        {
          // Need to add babel-loader as dependency: `yarn add -D babel-loader`
          loader: require.resolve("babel-loader"),
          // may or may not need this line depending on your app's setup
          options: {
            plugins: ["@babel/plugin-transform-react-jsx"],
          },
        },
        {
          loader: "@mdx-js/loader",
          /** @type {import('@mdx-js/loader').Options} */
          options: {
            providerImportSource: "@mdx-js/react",
            compilers: [createCompiler({})],
          },
        },
      ],
    });
    // add magic imports and isomorphic imports to Storybook
    // Webpack4
    //withVulcan.node = { ...(withVulcan.node || {}), fs: "empty" };
    //  Storybook seems unhappy with fallback, probably a version thing
    // delete withVulcan.resolve.fallback;
    // Webpack 5 @see https://stackoverflow.com/questions/64361940/webpack-error-configuration-node-has-an-unknown-property-fs
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      // TODO: smells like leaking server code in graphql package
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };
    return config;
  },
};
