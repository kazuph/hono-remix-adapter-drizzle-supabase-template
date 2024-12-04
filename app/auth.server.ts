import { json } from "@remix-run/cloudflare";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { createSupabaseServerClient } from "~/supabase.server";

export const signInWithGoogle = async (
  request: Request,
  c: AppLoadContext,
  successRedirectPath: string = "http://localhost:5173/auth/callback",
) => {
  const supabase = createSupabaseServerClient(request, c);
  const { data, error } = await supabase.client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: successRedirectPath,
    },
  });

  return {
    ok: !error && data ? true : false,
    data: data,
    error: error && !data ? error.message : "",
    headers: supabase.headers,
  };
};

export const signOut = async (request: Request, c: AppLoadContext, successRedirectPath: string = "/") => {
  const supabase = createSupabaseServerClient(request, c);
  const { error } = await supabase.client.auth.signOut();

  return json({
    ok: !error ? true : false,
    data: { url: successRedirectPath },
    error: error ? error.message : "",
    headers: supabase.headers,
  });
};

export const getUser = async (request: Request, c: AppLoadContext) => {
  const supabase = createSupabaseServerClient(request, c);

  const {
    data: { user },
  } = await supabase.client.auth.getUser();

  return user ?? null;
};

export const isUserLoggedIn = async (request: Request, c: AppLoadContext) => {
  const supabase = createSupabaseServerClient(request, c);

  const {
    data: { user },
  } = await supabase.client.auth.getUser();

  return !!user;
};
