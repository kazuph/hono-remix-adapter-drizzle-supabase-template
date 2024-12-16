import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import { createSupabaseServerClient } from "~/supabase.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { client } = createSupabaseServerClient(request, context);
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await client.auth.getUser();
    user = authUser;
  } catch (error) {
    // 認証エラーの場合はnullのままにする
    console.error("Auth error:", error);
  }

  return { user };
}

export default function UsersLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Outlet context={{ user }} />
    </div>
  );
}
