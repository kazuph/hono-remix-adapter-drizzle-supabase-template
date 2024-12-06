import { Hono } from "hono";
import postsApp from "./routes/posts";
import usersApp from "./routes/users";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use(async (c, next) => {
  await next();
  c.header("X-Powered-By", "Remix and Hono");
});

// const routes = app.route("/", usersApp).route("/", postsRoutes);
const postsRoute = app.route("/posts", postsApp);
const usersRoute = app.route("/users", usersApp);

// export type AppType = UsersAppType | PostsAppType;
export type AppType = typeof postsRoute | typeof usersRoute;
export default app;
