import { setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { jwt, sign } from "hono/jwt";

const COOKIE_NAME = "session";

export async function createSessionCookie(context: any, value: any) {
  const sessionSecret = context.env.JWT_SECRET;
  if (!sessionSecret) {
    throw new Error("環境変数 JWT_SECRET が設定されていません。");
  }
  const payload = {
    ...value,
    // Turnstileの有効期限（5分）より、少しだけ長くする（6分）
    exp: Math.floor(Date.now() / 1000) + 60 * 6,
  };
  const token = await sign(payload, context.env.JWT_SECRET);

  setCookie(context, COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
  });
}

type Bindings = {
  JWT_SECRET: string;
};

export const sessionMiddleware = () =>
  createMiddleware<{ Bindings: Bindings }>((c, next) => {
    // GET, HEAD, OPTIONS はスキップ
    if (c.req.method === "GET" || c.req.method === "HEAD" || c.req.method === "OPTIONS") {
      return next();
    }
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
      cookie: COOKIE_NAME,
    });
    return jwtMiddleware(c, next);
  });
