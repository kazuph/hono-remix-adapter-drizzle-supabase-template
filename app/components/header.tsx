import { Link } from "@remix-run/react";
import type { User } from "@supabase/supabase-js";
import { Rocket } from "lucide-react";

type HeaderProps = {
  user: User | null;
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="w-full p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Rocket className="w-6 h-6" />
          <span className="text-xl font-bold">Hono Remix Template</span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100">
                <img
                  src={user.user_metadata.avatar_url || "https://github.com/shadcn.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm">{user.email}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  to={`/users/${user.id}`}
                  className="block px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  記事一覧
                </Link>
                <Link
                  to={`/users/${user.id}/edit`}
                  className="block px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  プロフィール編集
                </Link>
                <form action="/logout" method="post">
                  <button type="submit" className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                    ログアウト
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-50">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
