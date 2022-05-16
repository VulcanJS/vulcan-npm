/** Use @next/mdx for a basic MDX support.
 * See the how Vulcan Next docs are setup with next-mdx-remote
 * which is more advanced (loading remote MD, supporting styling correctly etc.)
 */
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  /** @type {import('@mdx-js/loader').Options} */
  options: {
    jsxRuntime: "automatic",
  },
  // TODO: upgrade to v2 https://mdxjs.com/migrating/v2/
  // @see https://github.com/storybookjs/storybook/issues/17455
  // Currently (05/2022) we are blocked by Storybook which
  // doesn't support mdx v2
});

// Custom config from vulcan-next
const { extendNextConfig } = require("./packages/@vulcanjs/next-config");
const withPkgInfo = require("./.vn/nextConfig/withPkgInfo");
const withI18n = require("./.vn/nextConfig/withI18n");
const {
  vnRedirects,
  vnRewrites,
} = require("./.vn/nextConfig/redirectsAndRewrites");

const flowRight = require("lodash/flowRight");
const debug = require("debug")("vn:next");

// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
module.exports = (phase, { defaultConfig }) => {
  let extendedConfig;
  extendedConfig = extendNextConfig(defaultConfig);

  extendedConfig.env = {
    NEXT_PUBLIC_IS_USING_DEMO_DATABASE: !!(process.env.MONGO_URI || "").match(
      /lbke\-demo/
    ),
    NEXT_PUBLIC_IS_USING_LOCAL_DATABASE: !!(process.env.MONGO_URI || "").match(
      /localhost/
    ),
  };

  // Enable Webpack analyzer
  if (process.env.ANALYZE && process.env.ANALYZE !== "false") {
    const debug = require("debug")("webpack");
    debug("Enabling Webpack bundle analyzer");
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: process.env.ANALYZE === "true",
    });
    extendedConfig = withBundleAnalyzer(extendedConfig);
  }

  // Disable linting during build => the linter may have optional dev dependencies
  // (eslint-plugin-cypress) that wont exist during prod build
  // You should lint manually only
  extendedConfig.eslint = {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  };

  // To support markdown import
  extendedConfig.pageExtensions = ["js", "jsx", "md", "mdx", "ts", "tsx"];
  extendedConfig = flowRight([
    withPkgInfo,
    withMDX,
    withI18n,
    // add other wrappers here
  ])(extendedConfig);

  extendedConfig.redirects = async () => {
    // learn offline vs online
    return [...(await vnRedirects())];
  };
  extendedConfig.rewrites = async () => {
    // rewrite Vulcan Next page to "/vn"
    return [...(await vnRewrites())];
  };

  extendedConfig.experimental = {};
  /*{
    // @see https://github.com/isaachinman/next-i18next/issues/1202#issuecomment-871233853
    // @see https://github.com/vercel/next.js/issues/24700
    // Remove after update to Next 11.4+
    //outputFileTracing: true,
  };*/

  debug("Extended next config FINAL " + JSON.stringify(extendedConfig));

  return extendedConfig;
};
