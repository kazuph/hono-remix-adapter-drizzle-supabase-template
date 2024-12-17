import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { hc } from "hono/client";
import type { AppType } from "../../server";
export function getApiClient(context: LoaderFunctionArgs["context"], request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return hc<AppType>(baseUrl, {
    headers: {
      Cookie: request.headers.get("Cookie") ?? "",
      Authorization: `Bearer ${context.cloudflare.env.API_TOKEN}`,
    },
  });
}
