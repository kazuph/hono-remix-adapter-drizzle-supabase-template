import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { posts, users } from "../../app/schema";
import { requireAuth } from "../middleware/auth";
import { NotFoundError, handleError } from "../utils/error";
import type { AppEnv } from "./_index";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required").max(10000, "Content must be less than 10000 characters"),
  user_id: z.string().uuid("Invalid user ID format"),
  is_public: z.boolean().default(false),
});

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    try {
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

      const result = await c.var.db
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
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(posts.created_at));

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  })
  .post("/", requireAuth, zValidator("json", postSchema), async (c) => {
    try {
      const data = await c.req.json();

      // Check if user exists
      const userExists = await c.var.db.select({ id: users.id }).from(users).where(eq(users.id, data.user_id)).limit(1);

      if (userExists.length === 0) {
        throw new NotFoundError("User");
      }

      const result = await c.var.db.insert(posts).values(data).returning();
      return c.json(result[0]);
    } catch (error) {
      return handleError(c, error);
    }
  });

export default app;
