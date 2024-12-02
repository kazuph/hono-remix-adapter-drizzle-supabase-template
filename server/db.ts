import { drizzle } from "drizzle-orm/postgres-js";
import type { Context } from "hono";
import postgres from "postgres";

export function getDb(c: Context<{ Bindings: Env }>) {
  const client = postgres(c.env.DATABASE_URL, {
    prepare: false, // Disable prefetch for "Transaction" pool mode
  });
  return drizzle(client);
}
