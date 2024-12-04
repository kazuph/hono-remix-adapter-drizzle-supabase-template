import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getApiClient } from "~/lib/client";
import { createSupabaseServerClient } from "~/supabase.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const supabase = createSupabaseServerClient(request, context);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    await supabase.client.auth.exchangeCodeForSession(code);

    // セッション情報を取得
    const {
      data: { user },
    } = await supabase.client.auth.getUser();
    if (!user) {
      return redirect("/auth/login");
    }

    try {
      // APIクライアントを使用してユーザーの存在確認
      const client = getApiClient(request);
      console.log("🔍 Checking user existence for ID:", user.id);
      const response = await client.api.users.$get({
        query: { id: user.id },
      });
      console.log("📡 API Response:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      const responseBody = await response.text();
      console.log("📦 Response body:", responseBody);

      if (!response.ok || responseBody === "[]") {
        console.log("⚠️ User not found (empty response or error), redirecting to profile completion");
        // ユーザーが存在しない場合は、ユーザー情報入力ページへリダイレクト
        return redirect("/auth/complete-profile", {
          headers: supabase.headers,
        });
      }
    } catch (error) {
      // エラーの場合も新規ユーザーとして扱う
      console.error("❌ Error during user check:", error);
      return redirect("/auth/complete-profile", {
        headers: supabase.headers,
      });
    }
  }

  // 既存ユーザーの場合はホームページへ
  return redirect("/", {
    headers: supabase.headers,
  });
}
