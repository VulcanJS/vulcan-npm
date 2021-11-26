/**
 * Expose one and only one instance of MSW server so we can use runtime handlers
 * in Jest unit tests
 * @see https://mswjs.io/docs/api/setup-server/use
 */
import { setupServer } from "msw/node";
export const mswServer = setupServer();
