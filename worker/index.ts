import { Hono } from "hono";
import { authRoutes } from "./authRoutes";
import { boardRoutes } from "./boardRoutes";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>().basePath("/api");

// The session cookie is SameSite=Lax, and on top of that any request that
// changes something must come from this site and carry JSON, which a form
// on another site cannot send.
app.use("*", async (c, next) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    const origin = c.req.header("origin");
    if (origin && origin !== new URL(c.req.url).origin) return c.json({ error: "Cross-site request refused." }, 403);
    const hasBody = c.req.header("content-length") !== "0" && c.req.header("content-type") !== undefined;
    if (hasBody && !c.req.header("content-type")?.startsWith("application/json")) {
      return c.json({ error: "Send JSON." }, 415);
    }
  }
  await next();
});

app.route("/", authRoutes);
app.route("/", boardRoutes);
app.notFound((c) => c.json({ error: "Not found." }, 404));
app.onError((_error, c) => c.json({ error: "Something went wrong. Try again." }, 500));

export default app;
