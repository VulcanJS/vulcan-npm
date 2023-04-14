import { NextFetchEvent, NextRequest } from "next/server";
import {
  debugMatcher,
  debugMiddleware,
} from "~/vulcan-demo/edge-middlewares/debugMiddleware";
import {
  megaparamMatcher,
  megaParamMiddleware,
} from "~/vulcan-demo/edge-middlewares/megaparamMiddleware";

export function middleware(req: NextRequest, event: NextFetchEvent) {
  // TODO: how to reuse the "debugMatcher" which is not really a regex?
  if (req.url.match(/debug/)) {
    return debugMiddleware(req, event);
  }
  if (req.url.match(/megaparam-demo/)) {
    return megaParamMiddleware(req, event);
  }
}
export const config = {
  matchers: [debugMatcher], //, megaparamMatcher],
};
