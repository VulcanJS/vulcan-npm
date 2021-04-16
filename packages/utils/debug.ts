// Show a deprecation message, with a version so we keep track of deprecated features
export const deprecate = (currentVulcanVersion, message) => {
  if (process.env.NODE_ENV === "development") {
    console.warn(`DEPRECATED (${currentVulcanVersion}):`, message);
  }
};
