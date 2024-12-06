import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getApiClient } from "~/lib/client";
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

  const apiClient = getApiClient(request);
  let users = [];
  try {
    const usersResponse = await apiClient.api.users.$get();
    users = await usersResponse.json();
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

  return json({ user, users });
}

export default function UsersLayout() {
  const { user, users } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Outlet context={{ user, users }} />
    </div>
  );
}
