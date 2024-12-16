import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getApiClient } from "~/lib/client";
import { createSupabaseServerClient } from "~/supabase.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const supabase = createSupabaseServerClient(request, context);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const { error: exchangeError } = await supabase.client.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("❌ Exchange code error:", exchangeError);
      return redirect("/login");
    }

    // セッション情報を取得
    const {
      data: { user },
      error: getUserError,
    } = await supabase.client.auth.getUser();

    console.log("🔍 Auth callback getUser result:", {
      user,
      error: getUserError,
      cookies: request.headers.get("Cookie"),
      headers: supabase.headers,
    });

    if (!user || getUserError) {
      console.error("❌ Get user error:", getUserError);
      return redirect("/login");
    }

    try {
      // APIクライアントを使用してユーザーの存在確認
      const client = getApiClient(context, request);
      console.log("🔍 Checking user existence for ID:", user.id);
      const response = await client.api.users.$get({
        query: { id: user.id },
      });
      console.log("📡 API Response:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      const responseBody = await response.json();
      console.log("📦 Response body:", responseBody);

      if (!response.ok || !responseBody || (Array.isArray(responseBody) && responseBody.length === 0)) {
        console.log("⚠️ User not found, redirecting to profile completion");
        console.log("🔄 Redirecting to complete-profile with headers:", {
          headers: Object.fromEntries(supabase.headers.entries()),
          cookies: supabase.headers.get("Set-Cookie"),
        });

        // ユーザーが存在しない場合は、ユーザー情報入力ページへリダイレクト
        return redirect("/complete-profile", {
          headers: supabase.headers,
        });
      }

      // ユーザーが存在する場合はホームページへ
      return redirect("/", {
        headers: supabase.headers,
      });
    } catch (error) {
      // エラーの場合も新規ユーザーとして扱う
      console.error("❌ Error during user check:", error);
      return redirect("/complete-profile", {
        headers: supabase.headers,
      });
    }
  }

  console.log("🔄 Redirecting to home with headers:", {
    headers: Object.fromEntries(supabase.headers.entries()),
    cookies: supabase.headers.get("Set-Cookie"),
  });

  // 既存ユーザーの場合はホームページへ
  return redirect("/", {
    headers: supabase.headers,
  });
}
