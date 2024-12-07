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
        // console.log({ cookie: c.req.header("Cookie") });
        return parseCookieHeader(c.req.header("Cookie") ?? "");
      },
      setAll(cookiesToSet) {},
    },
    cookieOptions: {
      httpOnly: true,
      secure: true,
    },
  });

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    console.log({ user });

    if (error || !user) {
      console.error("Auth Error:", error);
      return c.json({ error: "Unauthorized", details: error?.message }, 401);
    }

    c.set("user", user);
    await next();
  } catch (error) {
    console.error("Auth Error:", error);
    return c.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      401,
    );
  }
};
