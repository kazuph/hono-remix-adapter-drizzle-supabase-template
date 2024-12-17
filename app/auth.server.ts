import { type AppLoadContext } from "@remix-run/cloudflare";
import { createCookie } from "@remix-run/cloudflare";
import { jwt, sign } from "hono/jwt";
import { createSupabaseServerClient } from "~/supabase.server";

const COOKIE_NAME = "session";

export async function getUser(request: Request, context: AppLoadContext) {
  const supabase = createSupabaseServerClient(request, context);
  const cookie = request.headers.get("Cookie");

  // Cookieが存在しない場合は早期リターン
  if (!cookie?.includes("sb-")) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.client.auth.getUser();

  if (error) {
    // セッションエラーの場合は静かに処理
    if (error.message === "Auth session missing!") {
      return null;
    }
    console.error("❌ getUser error:", error);
    return null;
  }

  return user;
}

export async function createSessionCookie(context: any, value: any) {
  const sessionSecret = context.cloudflare.env.JWT_SECRET;
  if (!sessionSecret) {
    throw new Error("環境変数 JWT_SECRET が設定されていません。");
  }
  const payload = {
    ...value,
    // Turnstileの有効期限（5分）より、少しだけ長くする（6分）
    exp: Math.floor(Date.now() / 1000) + 60 * 6,
  };
  const token = await sign(payload, context.cloudflare.env.JWT_SECRET);

  const cookie = createCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return cookie;
}

export const signInWithGoogle = async (request: Request, c: AppLoadContext, successRedirectPath?: string) => {
  const supabase = createSupabaseServerClient(request, c);

  const url = new URL(request.url);
  const redirectTo = successRedirectPath || `${url.origin}/auth/callback`;

  const { data, error } = await supabase.client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  return {
    ok: !error && data ? true : false,
    data: data,
    error: error && !data ? error.message : "",
    headers: supabase.headers,
  };
};

export const signOut = async (request: Request, c: AppLoadContext, successRedirectPath: string) => {
  const supabase = createSupabaseServerClient(request, c);
  const { error } = await supabase.client.auth.signOut();

  return {
    ok: !error ? true : false,
    data: { url: successRedirectPath },
    error: error ? error.message : "",
    headers: supabase.headers,
  };
};
