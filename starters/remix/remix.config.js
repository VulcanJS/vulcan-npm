/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  /**
   * Remove if not using Vercel
   * @see https://remix.run/docs/en/v1/api/conventions#serverbuildtarget
   * @see https://github.com/robipop22/dnb-stack/blob/main/remix.config.js
   * */
  serverBuildTarget: "vercel",
};
