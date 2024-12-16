import { sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
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

// Helper type for getting the db from context
export type Database = ReturnType<typeof drizzle<typeof schema>>;

// Helper type for transactions
export type QueryInTransaction<T> = (tx: PgTransaction<any, typeof schema, any>) => Promise<T>;

// Helper function for RLS queries
export const rlsQuery = async <T>(
  db: Database,
  userId: string | null, // nullの場合はanon
  txFunc: QueryInTransaction<T>,
) => {
  return await db.transaction(async (tx) => {
    if (userId) {
      // authenticated ユーザーの場合
      await tx.execute(sql`set session role authenticated`);
      await tx.execute(sql`select set_config('request.jwt.claim.sub', ${userId}, true)`);
    } else {
      // anon ユーザーの場合
      await tx.execute(sql`set session role anon`);
    }

    return await txFunc(tx);
  });
};

export const db: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const client = postgres(c.env.DATABASE_URL, {
    prepare: false,
  });
  const db = drizzle(client, { schema });
  c.set("db", db);
  await next();
  await client.end();
};
