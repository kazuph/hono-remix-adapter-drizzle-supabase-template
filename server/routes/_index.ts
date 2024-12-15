import { Hono } from "hono";

import posts from "./posts";
import users from "./users";

const app = new Hono<{ Bindings: Env }>().route("/posts", posts).route("/users", users);

export default app;
