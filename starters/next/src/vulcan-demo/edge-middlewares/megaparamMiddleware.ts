import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { encode } from "~/pages/vn/examples/[M]/megaparam-demo";
export const megaparamMatcher = "/vn/examples/:M/megaparam-demo";
// @see https://blog.vulcanjs.org/render-anything-statically-with-next-js-and-the-megaparam-4039e66ffde
export function megaParamMiddleware(req: NextRequest, event: NextFetchEvent) {
  // get the current params from the cookies, eg theme
  // you can also get them from headers, url, route params...
  const theme = (req.cookies["theme"] || "light") as "light" | "dark";
  const company = req.cookies["company"] || "Unknown_company";
  // Here, you could run some checks, like
  // verifying that current user can actually access this company
  // and that the theme is valid
  const isValid = true;
  // convert to a megaparam
  const megaparam = encode({
    theme,
    company,
  });
  // This patterns guarantee that the URL is absolute
  req.nextUrl.pathname = `/vn/examples/${megaparam}/megaparam-demo`;
  const res = NextResponse.rewrite(req.nextUrl);
  // remember theme if not yet done
  if (!req.cookies["theme"]) {
    res.cookies["theme"] = theme;
  }
  if (!req.cookies["company"]) {
    res.cookies["my_company"] = theme;
  }
  return res;
}
