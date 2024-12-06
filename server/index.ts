import { Hono } from "hono";
import posts from "./routes/posts";
import users from "./routes/users";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use(async (c, next) => {
  await next();
  c.header("X-Powered-By", "Remix and Hono");
});

const route = app.route("/posts", posts).route("/users", users);

export default app;
export type AppType = typeof route;
