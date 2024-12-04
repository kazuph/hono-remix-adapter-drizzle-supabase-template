import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { getUser } from "~/auth.server";
import { Header } from "~/components/header";
import { getApiClient } from "~/lib/client";
import type { SelectUser } from "./schema";

import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

interface ErrorResponse {
  error: string;
  details: string;
}

function isErrorResponse(response: any): response is ErrorResponse {
  return "error" in response;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await getUser(request, context);

  // ユーザー一覧を取得
  const apiClient = getApiClient(request);
  const usersResponse = await apiClient.api.users.$get();
  const usersData = await usersResponse.json();

  if (isErrorResponse(usersData)) {
    throw new Error(`Failed to fetch users: ${usersData.error}`);
  }

  return { user, users: usersData };
}

export default function App() {
  const { user, users } = useLoaderData<typeof loader>();

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <Header user={user} />
          <main className="flex-1">
            <Outlet context={{ user, users }} />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
