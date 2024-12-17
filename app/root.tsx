import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { getUser } from "~/auth.server";
import { Header } from "~/components/header";
import { getApiClient } from "~/lib/client";

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
  const authUser = await getUser(request, context);

  const apiClient = getApiClient(context, request);
  const postsResponse = await apiClient.api.posts.$get();
  const postsData = await postsResponse.json();

  if (isErrorResponse(postsData)) {
    throw new Error(`Failed to fetch posts: ${postsData.error}`);
  }

  return {
    authUser,
    posts: postsData,
  };
}

export default function App() {
  const { authUser, posts } = useLoaderData<typeof loader>();

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <Header user={authUser} />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Outlet context={{ posts }} />
          </main>
          <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2024 Your App Name. All rights reserved.</p>
            </div>
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
