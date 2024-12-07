import { hc } from "hono/client";
import type { AppType } from "../../server";

export function getApiClient(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}/${url.host}`;

  return hc<AppType>(baseUrl, { headers: { Cookie: request.headers.get("Cookie") ?? "" } });
}
