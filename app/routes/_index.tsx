import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { getApiClient } from "~/lib/client";
import type { SelectUser } from "~/schema";
import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

type ContextType = {
  user: User | null;
  users: SelectUser[];
};

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  user_name: string | null;
}

interface ErrorResponse {
  error: string;
  details: string;
}

function isErrorResponse(response: any): response is ErrorResponse {
  return "error" in response;
}

// 日付フォーマット用のヘルパー関数
function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(date));
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { client } = createSupabaseServerClient(request, context);
  const {
    data: { user },
  } = await client.auth.getUser();

  const apiClient = getApiClient(request);

  // クエリパラメータを含むパスを構築
  let path = "/api/posts";
  const searchParams = new URLSearchParams();
  if (!user) {
    searchParams.set("publicOnly", "true");
  } else {
    // ログインユーザーのIDを渡して、非公開記事の表示制御に使用
    searchParams.set("currentUserId", user.id);
  }
  if (searchParams.toString()) {
    path += `?${searchParams.toString()}`;
  }

  const postsResponse = await apiClient.api.posts.$get(path);
  const data = await postsResponse.json();

  if (isErrorResponse(data)) {
    throw new Error(`Failed to fetch posts: ${data.error}`);
  }

  // 投稿を新しい順にソート
  const sortedPosts = [...data].sort(
    (a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { postsData: sortedPosts };
}

export default function Index() {
  const { postsData } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<ContextType>();

  return (
    <div className="p-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Posts Section */}
        <div>
          {/* Header with New Post Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">投稿一覧</h2>
            {user && (
              <Link to="/posts/new">
                <Button>新規投稿</Button>
              </Link>
            )}
          </div>

          {/* Posts List */}
          <div className="border rounded-lg p-4">
            {!postsData || postsData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                まだ投稿がありません。最初の投稿を作成してみましょう！
              </div>
            ) : (
              <div className="space-y-4">
                {postsData.map((post: Post) => (
                  <div key={post.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{post.title}</h3>
                        <p className="text-sm text-gray-600">
                          投稿者:{" "}
                          <Link
                            to={`/users/${post.user_id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {post.user_name ?? "Unknown User"}
                          </Link>
                        </p>
                      </div>
                      {!post.is_public && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">非公開</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{post.content}</p>
                    <p className="text-xs text-gray-500">投稿日: {formatDate(post.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
