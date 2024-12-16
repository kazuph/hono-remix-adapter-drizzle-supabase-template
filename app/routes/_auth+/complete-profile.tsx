import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getApiClient } from "~/lib/client";
import type { InsertUser } from "~/schema";
import { createSupabaseServerClient } from "~/supabase.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const supabase = createSupabaseServerClient(request, context);
  const {
    data: { user },
  } = await supabase.client.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return {
    email: user.email,
    name: user.user_metadata.full_name || "",
    avatar_url: user.user_metadata.avatar_url,
  };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const supabase = createSupabaseServerClient(request, context);
  const {
    data: { user },
  } = await supabase.client.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  // APIクライアントを使用してユーザーを作成
  const client = getApiClient(context, request);
  const userData = {
    id: user.id,
    name: name || user.user_metadata.full_name,
    email: user.email!,
    bio: bio || null,
    avatar_url: user.user_metadata.avatar_url || null,
  } satisfies InsertUser;

  console.log("📝 Saving user data:", userData);
  const response = await client.api.users.$post({
    json: userData,
  });
  console.log("📡 Save response:", {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  });

  if (!response.ok) {
    console.error("❌ Failed to save user data");
    return { error: "ユーザー情報の保存に失敗しました" };
  }

  console.log("✅ User data saved successfully");

  return redirect("/");
}

export default function CompleteProfile() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">認証</h2>
        <h3 className="mt-6 text-center text-2xl font-bold text-gray-900">プロフィールを完成させる</h3>
        <p className="mt-2 text-center text-sm text-gray-600">あと少しで完了です！</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={data.name}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                自己紹介
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                プロフィールを保存
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
