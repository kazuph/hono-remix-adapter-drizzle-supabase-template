import { Link, useOutletContext } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import type { loader } from "~/root";
import type { SelectUser } from "~/schema";

type ContextType = {
  user: SelectUser | null;
  users: SelectUser[];
  posts: any[];
};

export default function Index() {
  const { user, users, posts } = useOutletContext<ContextType>();

  // 投稿を日付の降順でソート
  const sortedPosts = [...(posts || [])].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // ユーザーIDからユーザー情報を取得する関数
  const getUserById = (userId: string) => {
    return users?.find((user) => user.id === userId);
  };

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ようこそ {user?.name ?? "ゲスト"} さん</h1>
        <Link to="/posts/new">
          <Button className="bg-blue-500 hover:bg-blue-600">新規投稿</Button>
        </Link>
      </div>

      {/* 投稿一覧 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">投稿一覧</h2>
        <div className="space-y-4">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => {
              const postUser = getUserById(post.user_id);
              return (
                <div key={post.id} className="border-b pb-4">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-gray-600 mt-2">{post.content}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      投稿者:{" "}
                      <Link to={`/users/${post.user_id}`} className="text-blue-500 hover:text-blue-600">
                        {postUser?.name || "不明なユーザー"}
                      </Link>
                    </p>
                    <p className="text-sm text-gray-500">投稿日: {new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">投稿はまだありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
