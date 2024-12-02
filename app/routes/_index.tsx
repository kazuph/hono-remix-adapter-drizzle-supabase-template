import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Rocket } from "lucide-react";
import { getApiClient } from "~/lib/client";
import type { SelectPost, SelectUser } from "~/schema";
export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  try {
    const client = getApiClient(request);
    const [usersRes, postsRes] = await Promise.all([client.api.users.$get(), client.api.posts.$get()]);

    if (!usersRes.ok || !postsRes.ok) {
      const usersError = await usersRes.text();
      const postsError = await postsRes.text();
      console.error("API Error:", { usersError, postsError });
      throw new Error("API request failed");
    }

    const [users, posts] = await Promise.all([usersRes.json(), postsRes.json()]);

    if ("error" in users || "error" in posts) {
      console.error("API Error:", { users, posts });
      throw new Error("Failed to fetch data");
    }

    return {
      users: users as SelectUser[],
      posts: (posts as any[]).map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      })),
    };
  } catch (error) {
    console.error("Loader error:", error);
    throw error;
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            <span className="text-xl font-bold">Hono Remix Template</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Posts</h2>
            <div className="border rounded-lg p-4">
              {data.posts.map((post) => (
                <div key={post.id} className="mb-2 p-2 border-b last:border-b-0">
                  <p className="font-bold">{post.title}</p>
                  <p className="text-sm">{post.content}</p>
                  <p className="text-xs text-gray-600">投稿者: {post.userName}</p>
                  <p className="text-xs text-gray-600">作成日: {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full p-4 border-t">
        <div className="container mx-auto text-center text-sm text-gray-600"></div>
      </footer>
    </div>
  );
}
