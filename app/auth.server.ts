import { json } from "@remix-run/cloudflare";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { createCookie } from "@remix-run/cloudflare";
import { jwt, sign } from "hono/jwt";
import { createSupabaseServerClient } from "~/supabase.server";

const COOKIE_NAME = "session";

export async function getUser(request: Request, context: AppLoadContext) {
  const supabase = createSupabaseServerClient(request, context);
  const {
    data: { user },
  } = await supabase.client.auth.getUser();
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

export const signInWithGoogle = async (request: Request, context: AppLoadContext) => {
  const supabase = createSupabaseServerClient(request, context);
  const { data, error } = await supabase.client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    return json({
      error: error.message,
      data: null,
      headers: {},
    });
  }

  return json({
    error: null,
    data: { url: data.url },
    headers: supabase.headers,
  });
};

export const signOut = async (request: Request, c: AppLoadContext, successRedirectPath: string) => {
  const supabase = createSupabaseServerClient(request, c);
  const { error } = await supabase.client.auth.signOut();

  let headers = new Headers();
  if (!error) {
    const cookie = createCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    headers.append("Set-Cookie", await cookie.serialize("", { expires: new Date(0) }));
  }

  return json({
    ok: !error ? true : false,
    data: { url: successRedirectPath },
    error: error ? error.message : "",
    headers,
  });
};
