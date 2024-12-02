import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { postsTable, usersTable } from "../app/schema";
import { getDb } from "./db";

const app = new Hono<{ Bindings: Env }>();

app.use(async (c, next) => {
  await next();
  c.header("X-Powered-By", "Remix and Hono");
});

const route = app
  .get("/api/users", async (c) => {
    try {
      console.log("Starting /api/users request with env:", {
        hasDbUrl: !!c.env.DATABASE_URL,
      });
      const db = getDb(c);
      console.log("DB connection established");
      const users = await db.select().from(usersTable);
      console.log("Query executed successfully");
      return c.json(users);
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
      const posts = await db
        .select({
          id: postsTable.id,
          title: postsTable.title,
          content: postsTable.content,
          createdAt: postsTable.createdAt,
          updatedAt: postsTable.updatedAt,
          userId: postsTable.userId,
          userName: usersTable.name,
        })
        .from(postsTable)
        .leftJoin(usersTable, eq(postsTable.userId, usersTable.id));
      return c.json(posts);
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
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      }),
    ),
    async (c) => {
      try {
        const data = await c.req.json();
        const db = getDb(c);
        const result = await db.insert(usersTable).values(data).returning();
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
        userId: z.number(),
      }),
    ),
    async (c) => {
      try {
        const data = await c.req.json();
        const db = getDb(c);
        const result = await db.insert(postsTable).values(data).returning();
        return c.json(result[0]);
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to create post" }, 500);
      }
    },
  );

export type AppType = typeof route;
export default app;
