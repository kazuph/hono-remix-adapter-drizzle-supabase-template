import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { getUser } from "~/auth.server";
import { Header } from "~/components/header";

import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await getUser(request, context);
  return { user };
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

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
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
