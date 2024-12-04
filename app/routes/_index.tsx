import type { MetaFunction } from "@remix-run/cloudflare";
import { useOutletContext } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";
import type { SelectPost, SelectUser } from "~/schema";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

type ContextType = {
  user: User | null;
  users: SelectUser[];
  posts: SelectPost[];
};

// 日付フォーマット用のヘルパー関数
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export default function Index() {
  const { users = [], posts = [] } = useOutletContext<ContextType>() || {};

  return (
    <div className="p-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Posts */}
        <div className="md:col-span-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Posts</h2>
            <div className="border rounded-lg p-4">
              {posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  まだ投稿がありません。最初の投稿を作成してみましょう！
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="mb-2 p-2 border-b last:border-b-0">
                    <p className="font-bold">{post.title}</p>
                    <p className="text-sm">{post.content}</p>
                    <p className="text-xs text-gray-600">投稿者: {post.user_id}</p>
                    <p className="text-xs text-gray-600">作成日: {formatDate(post.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Users */}
        <div>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">ユーザー一覧</h2>
            <div className="border rounded-lg p-4">
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  まだユーザーがいません。最初のユーザーになりましょう！
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 mb-2 p-2 border-b last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      {user.bio && <p className="text-sm text-gray-700 mt-1 line-clamp-2">{user.bio}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
