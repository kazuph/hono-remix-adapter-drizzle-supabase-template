import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { posts, users } from "../app/schema";
import { getDb } from "./db";

const app = new Hono<{ Bindings: Env }>();

app.use(async (c, next) => {
  await next();
  c.header("X-Powered-By", "Remix and Hono");
});

const route = app
  .get("/api/users", async (c) => {
    try {
      const db = getDb(c);
      const result = await db.select().from(users);
      return c.json(result);
    } catch (error) {
      console.error("Detailed error in /api/users:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return c.text(`error code: ${error instanceof Error ? error.message : "1042"}`, 500);
    }
  })
  .get("/api/posts", async (c) => {
    try {
      const db = getDb(c);
      const result = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          created_at: posts.created_at,
          updated_at: posts.updated_at,
          user_id: posts.user_id,
          user_name: users.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.user_id, users.id));
      return c.json(result);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return c.json(
        {
          error: "Failed to fetch posts",
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  })
  .post(
    "/api/users",
    zValidator(
      "json",
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        bio: z.string().nullable().optional(),
        avatar_url: z.string().nullable().optional(),
      }),
    ),
    async (c) => {
      try {
        const data = await c.req.json();
        const db = getDb(c);
        const result = await db.insert(users).values(data).returning();
        return c.json(result[0]);
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to create user" }, 500);
      }
    },
  )
  .post(
    "/api/posts",
    zValidator(
      "json",
      z.object({
        title: z.string(),
        content: z.string(),
        user_id: z.string(),
      }),
    ),
    async (c) => {
      try {
        const data = await c.req.json();
        const db = getDb(c);
        const result = await db.insert(posts).values(data).returning();
        return c.json(result[0]);
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to create post" }, 500);
      }
    },
  );

export type AppType = typeof route;
export default app;
