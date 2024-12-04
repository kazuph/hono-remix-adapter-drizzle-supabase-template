import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const posts = pgTable("posts", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertPost = typeof posts.$inferInsert;
export type SelectPost = typeof posts.$inferSelect;
