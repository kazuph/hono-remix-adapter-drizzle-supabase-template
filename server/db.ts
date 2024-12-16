import { drizzle } from "drizzle-orm/postgres-js";
import type { MiddlewareHandler } from "hono";
import postgres from "postgres";
import * as schema from "../app/schema";

type HonoEnv = {
  Bindings: Env;
  Variables: {
    db: ReturnType<typeof drizzle<typeof schema>>;
  };
};

export const db: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const client = postgres(c.env.DATABASE_URL);
  const db = drizzle(client, { schema });
  c.set("db", db);
  await next();
  await client.end();
};

// Helper type for getting the db from context
export type Database = ReturnType<typeof drizzle<typeof schema>>;
