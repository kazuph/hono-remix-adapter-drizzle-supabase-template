import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { requireAuth } from "server/middleware/auth";
import { z } from "zod";
import { posts, users } from "../../app/schema";
import { NotFoundError, ValidationError, handleError } from "../utils/error";
import type { AppEnv } from "./_index";

const userCreateSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email format"),
  bio: z.string().max(500, "Bio must be less than 500 characters").nullable().optional(),
  avatar_url: z.string().url("Invalid URL format").nullable().optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").nullable(),
});

const app = new Hono<AppEnv>()
  .get("/", async (c) => {
    try {
      const email = c.req.query("email");
      const currentUserId = c.req.query("currentUserId") ?? null;

      const result = await c.var.db
        .select({
          id: users.id,
          name: users.name,
          avatar_url: users.avatar_url,
          email: users.email,
          bio: users.bio,
          created_at: users.created_at,
          updated_at: users.updated_at,
        })
        .from(users)
        .where(email ? eq(users.email, email) : undefined);

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  })
  .get("/:userId", async (c) => {
    try {
      const userId = c.req.param("userId");
      const currentUserId = c.req.query("currentUserId") ?? null;

      const user = await c.var.db
        .select({
          id: users.id,
          name: users.name,
          avatar_url: users.avatar_url,
          email: users.email,
          bio: users.bio,
          created_at: users.created_at,
          updated_at: users.updated_at,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (user.length === 0) {
        throw new NotFoundError("User");
      }
      const result = user[0];

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  })
  .patch("/:userId", requireAuth, zValidator("json", userUpdateSchema), async (c) => {
    try {
      const userId = c.req.param("userId");
      const data = await c.req.json();
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updated = await c.var.db.update(users).set(data).where(eq(users.id, userId)).returning({
        id: users.id,
        name: users.name,
        avatar_url: users.avatar_url,
        email: users.email,
        bio: users.bio,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

      if (updated.length === 0) {
        throw new NotFoundError("User");
      }
      const result = updated[0];

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  })
  .get("/:userId/posts", async (c) => {
    try {
      const userId = c.req.param("userId");
      const currentUserId = c.req.query("currentUserId") ?? null;

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
        .where(eq(posts.user_id, userId))
        .orderBy(desc(posts.created_at));

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  })
  .post("/", requireAuth, zValidator("json", userCreateSchema), async (c) => {
    try {
      const data = await c.req.json();
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Check if email already exists
      const emailExists = await c.var.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (emailExists.length > 0) {
        throw new ValidationError("Email already exists");
      }

      const inserted = await c.var.db.insert(users).values(data).returning({
        id: users.id,
        name: users.name,
        avatar_url: users.avatar_url,
        email: users.email,
        bio: users.bio,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });
      const result = inserted[0];

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  });

export default app;
