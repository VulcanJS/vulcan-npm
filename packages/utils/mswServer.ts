/**
 * Expose one and only one instance of MSW server so we can use runtime handlers
 * in Jest unit tests
 * @see https://mswjs.io/docs/api/setup-server/use
 */
import { setupServer } from "msw/node";

let mswServer;
/**
 * Return a global instance of MSW server
 * (initialize the server during first call)
 *
 * NOTE: keep this code within a function to avoid side effectr when loading the package
 * @returns
 */
export const getMswServer = () => {
  if (!mswServer) {
    mswServer = setupServer();
  }
  return mswServer;
};
