import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { getApiClient } from "~/lib/client";
import type { SelectUser } from "~/schema";
import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [{ title: "ユーザー詳細" }, { name: "description", content: "ユーザーの投稿一覧" }];
};

type ContextType = {
  user: User | null;
  users: SelectUser[];
};

// APIレスポンス用の型定義
interface ApiUser {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

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
  details?: string;
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

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const userId = params.userId;
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { client } = createSupabaseServerClient(request, context);
  const {
    data: { user },
  } = await client.auth.getUser();

  const apiClient = getApiClient(request);

  // ユーザー情報を取得
  const userResponse = await apiClient.api.users[":userId"].$get({
    param: { userId },
  });
  const userData: ApiUser | ErrorResponse = await userResponse.json();

  if (isErrorResponse(userData)) {
    throw new Error("User not found");
  }

  // ユーザーの投稿を取得
  const searchParams = new URLSearchParams();
  if (!user) {
    searchParams.set("publicOnly", "true");
  } else {
    searchParams.set("currentUserId", user.id);
  }

  const postsResponse = await apiClient.api.users[":userId"].posts.$get({
    param: { userId },
  });
  const data = await postsResponse.json();

  if (isErrorResponse(data)) {
    throw new Error(`Failed to fetch posts: ${data.error}`);
  }

  // 投稿を新しい順にソート
  const sortedPosts = [...data].sort(
    (a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { pageUser: userData, postsData: sortedPosts };
}

export default function UserDetail() {
  const { pageUser, postsData } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<ContextType>();

  return (
    <div className="p-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* User Profile Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{pageUser.name}</h1>
          {pageUser.bio && <p className="text-gray-600 mb-2">{pageUser.bio}</p>}
          {pageUser.email && <p className="text-gray-500 text-sm">Email: {pageUser.email}</p>}
        </div>

        {/* Posts Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">投稿一覧</h2>
            {user && user.id === pageUser.id && (
              <Link to="/posts/new">
                <Button>新規投稿</Button>
              </Link>
            )}
          </div>

          <div className="border rounded-lg p-4">
            {!postsData || postsData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">まだ投稿がありません。</div>
            ) : (
              <div className="space-y-4">
                {postsData.map((post: Post) => (
                  <div key={post.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{post.title}</h3>
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
