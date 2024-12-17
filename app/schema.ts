import { sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgPolicy } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { v7 as uuidv7 } from "uuid";

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    bio: text("bio"),
    avatar_url: text("avatar_url"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (users) => ({
    policies: [
      // Allow all users to view basic information
      pgPolicy("users_public_view", {
        for: "select",
        to: authenticatedRole,
        using: sql`true`,
        withCheck: sql`${users.id} = auth.uid() OR
        (${users.email} IS NULL AND ${users.bio} IS NULL)`,
      }),

      // Allow users to update their own records
      pgPolicy("users_self_update", {
        for: "update",
        to: authenticatedRole,
        using: sql`${users.id} = auth.uid()`,
        withCheck: sql`${users.id} = auth.uid()`,
      }),

      // Allow users to view their own detailed information
      pgPolicy("users_self_view_details", {
        for: "select",
        to: authenticatedRole,
        using: sql`${users.id} = auth.uid()`,
      }),
    ],
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    is_public: boolean("is_public").notNull().default(true),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (posts) => ({
    policies: [
      // Allow anyone to view public posts
      pgPolicy("posts_public_view", {
        for: "select",
        to: authenticatedRole,
        using: sql`${posts.is_public} = true`,
      }),

      // Allow creators to view their private posts
      pgPolicy("posts_private_view", {
        for: "select",
        to: authenticatedRole,
        using: sql`${posts.user_id} = auth.uid()`,
      }),

      // Allow authenticated users to create posts
      pgPolicy("posts_insert", {
        for: "insert",
        to: authenticatedRole,
        withCheck: sql`${posts.user_id} = auth.uid()`,
      }),

      // Allow creators to update their posts
      pgPolicy("posts_modify", {
        for: "update",
        to: authenticatedRole,
        using: sql`${posts.user_id} = auth.uid()`,
        withCheck: sql`${posts.user_id} = auth.uid()`,
      }),

      // Allow creators to delete their posts
      pgPolicy("posts_delete", {
        for: "delete",
        to: authenticatedRole,
        using: sql`${posts.user_id} = auth.uid()`,
      }),
    ],
  }),
);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertPost = typeof posts.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;
