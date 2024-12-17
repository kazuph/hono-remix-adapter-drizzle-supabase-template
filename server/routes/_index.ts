import type { User } from "@supabase/supabase-js";
import { Hono } from "hono";
import { type Database, db } from "../middleware/db";
import posts from "./posts";
import users from "./users";

type AppEnv = {
  Bindings: Env;
  Variables: {
    db: Database;
    user: User | null;
  };
};

const app = new Hono<AppEnv>().use("*", db).route("/posts", posts).route("/users", users);

export type { AppEnv };
export default app;
