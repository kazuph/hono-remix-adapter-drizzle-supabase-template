import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { MiddlewareHandler } from "hono";

export const requireAuth: MiddlewareHandler<{
  Bindings: Env;
  Variables: {
    user: User | null;
  };
}> = async (c, next) => {
  const client = createServerClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          c.header("Set-Cookie", serializeCookieHeader(name, value, options)),
        );
      },
    },
  });

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (error || !user) {
      return c.json(
        {
          error: "Unauthorized",
          details: error?.message || "No user found",
        },
        401,
      );
    }

    c.set("user", user);
    await next();
  } catch (error) {
    return c.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      401,
    );
  }
};
