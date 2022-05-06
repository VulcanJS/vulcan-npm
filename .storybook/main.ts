import { WebpackPluginInstance, Configuration } from "webpack";
module.exports = {
  core: {
    builder: "webpack5",
  },
  stories: [
    // TODO: reenable progressively, we currently have an issue with build never ending
    "../packages/react-ui/**/*.stories.@(js|jsx|tsx)",
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
  ],
  webpackFinal: async (config: Configuration, { configType }) => {
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
