import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { loggerMiddleware } from "./middleware/logger";
import { sessionMiddleware } from "./middleware/session";
import api from "./routes/_index";

const app = new Hono<{ Bindings: Env }>();

// ロギングミドルウェア（最初に配置して全てのリクエストをログ）
app.use("/api/*", loggerMiddleware);

// CSRF
app.use("/api/*", async (c, next) => {
  const csrfMiddlewareHandler = csrf({
    origin: c.env.PUBLIC_URL,
  });
  return csrfMiddlewareHandler(c, next);
});

// CORS
app.use("/api/*", async (c, next) => {
  const corsMiddlewareHandler = cors({
    origin: c.env.PUBLIC_URL,
  });
  return corsMiddlewareHandler(c, next);
});

// セッションミドルウェアの設定
app.use("/api/*", sessionMiddleware());

app.use(async (c, next) => {
  await next();
  c.header("X-Powered-By", "Remix and Hono");
});

const route = app.route("/api", api);

export default app;
export type AppType = typeof route;
