import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { sessionMiddleware } from "./middleware/session";
import api from "./routes/_index";

const app = new Hono<{ Bindings: Env }>();

// セキュリティヘッダー（デフォルト値を活用）
app.use(
  "*",
  secureHeaders({
    // CSPの詳細設定
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'", "https://api.supabase.co"],
      fontSrc: ["'self'", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // X-Frame-Options: DENYと同等
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"], // 推奨されるセキュリティ設定
      upgradeInsecureRequests: [], // HTTPSへの自動アップグレード
    },
    // クロスオリジン関連の設定
    crossOriginEmbedderPolicy: false, // Remixとの互換性のため
    crossOriginOpenerPolicy: false, // Remixとの互換性のため
    crossOriginResourcePolicy: false, // Remixとの互換性のため
    // 基本的なセキュリティヘッダーはデフォルト値を使用
    xFrameOptions: true, // SAMEORIGIN
    xContentTypeOptions: true, // nosniff
    referrerPolicy: "strict-origin-when-cross-origin",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    // パーミッションポリシー
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      bluetooth: [],
    },
  }),
);

// ビルトインのロガーミドルウェア
app.use("/api/*", logger());

// Bearer認証（すべてのAPIエンドポイントに対して）
app.use("/api/*", async (c, next) => {
  const authMiddleware = bearerAuth({ token: c.env.API_TOKEN });
  return authMiddleware(c, next);
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
