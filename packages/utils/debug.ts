// Show a deprecation message, with a version so we keep track of deprecated features
export const deprecate = (currentVulcanVersion, message) => {
  if (process.env.NODE_ENV === "development") {
    console.warn(`DEPRECATED (${currentVulcanVersion}):`, message);
  }
};

import debug from "debug";
/**
 * @example const debugForm = debugVulcan("form");
 * debugForm("Got some values in form")
 */
export const debugVulcan = (suffix: string) => debug(`vulcan:${suffix}`);
