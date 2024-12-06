import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Form, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { getApiClient } from "~/lib/client";
import { createSupabaseServerClient } from "~/supabase.server";

interface PostResponse {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  user_id: string;
}

interface ErrorResponse {
  error: string;
}

function isErrorResponse(response: any): response is ErrorResponse {
  return "error" in response;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const isPublic = formData.get("isPublic") === "true";

  const { client } = createSupabaseServerClient(request, context);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiClient = getApiClient(request);
  const response = await apiClient.api.posts.$post({
    json: {
      title,
      content,
      is_public: isPublic,
      user_id: user.id,
    },
  });

  const data = await response.json();

  if (!response.ok || isErrorResponse(data)) {
    return json({ error: isErrorResponse(data) ? data.error : "Failed to create post" }, { status: response.status });
  }

  return redirect("/");
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { client } = createSupabaseServerClient(request, context);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return json({});
}

export default function NewPost() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">新規投稿</h1>
      <Form method="post" className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full p-2 border rounded-md bg-white text-black"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            内容
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={5}
            className="w-full p-2 border rounded-md bg-white text-black"
          />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isPublic" value="true" defaultChecked className="rounded" />
            <span className="text-sm">公開する</span>
          </label>
        </div>
        <div className="flex gap-4">
          <Button type="submit">投稿する</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            キャンセル
          </Button>
        </div>
      </Form>
    </div>
  );
}
