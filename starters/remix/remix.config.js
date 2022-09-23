/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  /**
   * Remove if not using Vercel
   * @see https://remix.run/docs/en/v1/api/conventions#serverbuildtarget
   * */
  serverBuildTarget: "vercel",
  /**
   * Remove if not using Vercel
   *
   * Inspiredf from DNB stack.
   *
   * @example
   * yarn run dev => remix dev server
   * yarn run build => use remix prod server, locally
   * VERCEL=1 yarn run build => use vercel server, locally
   * On Vercel: => yarn run build will use vercel server (VERCEL is automatically set)
   *
   * @see https://vercel.com/docs/concepts/projects/environment-variables
   *
   * @see https://github.com/robipop22/dnb-stack/blob/main/remix.config.js
   */
  server: process.env.VERCEL ? "./vercel.server.js" : undefined,
};
