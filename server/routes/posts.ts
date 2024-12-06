import { zValidator } from "@hono/zod-validator";
import { and, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { posts, users } from "../../app/schema";
import { getDb } from "../db";

const postsApp = new Hono<{ Bindings: Env }>().basePath("/");

const postsRoutes = postsApp
  .get("/", async (c) => {
    try {
      const db = getDb(c);
      const currentUserId = c.req.query("currentUserId");
      const isPublicOnly = c.req.query("publicOnly") === "true";

      let conditions = [];

      if (isPublicOnly || !currentUserId) {
        conditions.push(eq(posts.is_public, true));
      } else {
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
    "/",
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

export default postsRoutes;
