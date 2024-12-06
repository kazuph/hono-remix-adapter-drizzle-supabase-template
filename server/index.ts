import { zValidator } from "@hono/zod-validator";
import { and, eq, or } from "drizzle-orm";
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
  .get("/api/users/:userId", async (c) => {
    try {
      const userId = c.req.param("userId");
      const db = getDb(c);
      const result = await db.select().from(users).where(eq(users.id, userId));

      if (result.length === 0) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json(result[0]);
    } catch (error) {
      console.error("Error fetching user:", error);
      return c.json(
        {
          error: "Failed to fetch user",
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  })
  .patch(
    "/api/users/:userId",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        bio: z.string().nullable(),
      }),
    ),
    async (c) => {
      try {
        const userId = c.req.param("userId");
        const data = await c.req.json();
        const db = getDb(c);

        const result = await db.update(users).set(data).where(eq(users.id, userId)).returning();

        if (result.length === 0) {
          return c.json({ error: "User not found" }, 404);
        }

        return c.json(result[0]);
      } catch (error) {
        console.error("Error updating user:", error);
        return c.json(
          {
            error: "Failed to update user",
            details: error instanceof Error ? error.message : String(error),
          },
          500,
        );
      }
    },
  )
  .get("/api/users/:userId/posts", async (c) => {
    try {
      const db = getDb(c);
      const userId = c.req.param("userId");
      const currentUserId = c.req.query("currentUserId");
      const isPublicOnly = c.req.query("publicOnly") === "true";

      const conditions = [eq(posts.user_id, userId)];

      // 非公開記事の表示制御
      if (currentUserId !== userId) {
        // 他人のページを見ている場合は公開記事のみ
        conditions.push(eq(posts.is_public, true));
      }

      const result = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          created_at: posts.created_at,
          updated_at: posts.updated_at,
          user_id: posts.user_id,
          is_public: posts.is_public,
          user_name: users.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.user_id, users.id))
        .where(and(...conditions));

      return c.json(result);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return c.json(
        {
          error: "Failed to fetch user posts",
          details: error instanceof Error ? error.message : String(error),
        },
        500,
      );
    }
  })
  .get("/api/posts", async (c) => {
    try {
      const db = getDb(c);
      const currentUserId = c.req.query("currentUserId");
      const isPublicOnly = c.req.query("publicOnly") === "true";

      let conditions = [];

      if (isPublicOnly || !currentUserId) {
        // 未ログインまたはpublicOnlyの場合は公開記事のみ
        conditions.push(eq(posts.is_public, true));
      } else {
        // ログイン済みの場合：公開記事 + 自分の非公開記事
        conditions.push(
          or(eq(posts.is_public, true), and(eq(posts.is_public, false), eq(posts.user_id, currentUserId))),
        );
      }

      const result = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          created_at: posts.created_at,
          updated_at: posts.updated_at,
          user_id: posts.user_id,
          is_public: posts.is_public,
          user_name: users.name,
        })
        .from(posts)
        .leftJoin(users, eq(posts.user_id, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined);

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
        is_public: z.boolean().optional(),
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
