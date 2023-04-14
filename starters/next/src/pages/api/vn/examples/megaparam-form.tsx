import { NextRequest, NextResponse } from "next/server";

export default async (req: NextRequest) => {
  // TODO: this doesn't work because we cannot use a POST request here
  // otherwise we fail to redirect using a GET afterwards
  // const formData = await req.formData();
  // const theme = formData.get("theme")?.toString();
  // const company = formData.get("company")?.toString();
  const url = new URL(req.url);
  const theme = url.searchParams.get("theme");
  const company = url.searchParams.get("company");

  // Redirect back to the page with an absolute URL
  const pageUrl = new URL("/vn/examples/megaparam-demo", req.url);
  const res = NextResponse.redirect(pageUrl);

  if (theme && ["light", "dark"].includes(theme)) {
    res.cookies.set("theme", theme);
  }
  if (company) {
    res.cookies.set("my_company", company);
  }
  return res;
};

export const config = {
  runtime: "experimental-edge",
};
