/**
 * From DNB stack
 * @see https://github.com/robipop22/dnb-stack/blob/main/server.js
 * Remove this ifle if not using Vercel
 */
import { createRequestHandler } from "@remix-run/vercel";
import * as build from "@remix-run/dev/server-build";

console.debug("Running with vercel.server.js");
export default createRequestHandler({ build, mode: process.env.NODE_ENV });
