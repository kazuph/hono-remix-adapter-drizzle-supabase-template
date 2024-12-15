import type { User } from "@supabase/supabase-js";
import type { MiddlewareHandler } from "hono";
import { Logger } from "../utils/logger";

export const loggerMiddleware: MiddlewareHandler<{
  Variables: {
    user: User | null;
  };
}> = async (c, next) => {
  const startTime = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const user = c.get("user");

  // リクエスト開始ログ
  Logger.info(
    "Request started",
    {
      query: c.req.query(),
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    },
    user?.id,
    path,
    method,
  );

  try {
    await next();
  } catch (error) {
    // エラーログ
    Logger.error(
      "Request failed",
      {
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      },
      user?.id,
      path,
      method,
    );
    throw error;
  }

  // レスポンスタイムの計算
  const responseTime = Date.now() - startTime;

  // リクエスト完了ログ
  Logger.info(
    "Request completed",
    {
      responseTime: `${responseTime}ms`,
      status: c.res.status,
    },
    user?.id,
    path,
    method,
  );
};
