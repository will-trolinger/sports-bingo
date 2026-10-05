import { Hono, type Context } from "hono";
import { hashPassword, verifyPassword } from "./password";
import { endSession, findUser, startSession } from "./session";
import type { AppEnv } from "./types";

const USERNAME = /^[A-Za-z0-9_-]{3,20}$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;

interface Credentials {
  username: string;
  password: string;
}

async function readCredentials(c: Context<AppEnv>): Promise<Credentials | string> {
  const body = await c.req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!USERNAME.test(username)) return "Usernames are 3 to 20 letters, numbers, dashes or underscores.";
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    return `Passwords need at least ${MIN_PASSWORD} characters.`;
  }
  return { username, password };
}

// Per IP address, shared by sign-up and log-in (wrangler.jsonc).
async function rateLimited(c: Context<AppEnv>): Promise<boolean> {
  const ip = c.req.header("cf-connecting-ip") ?? "local";
  const { success } = await c.env.AUTH_LIMITER.limit({ key: ip });
  return !success;
}

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/auth/signup", async (c) => {
  if (await rateLimited(c)) return c.json({ error: "Too many attempts. Try again in a minute." }, 429);
  const credentials = await readCredentials(c);
  if (typeof credentials === "string") return c.json({ error: credentials }, 400);
  const { hash, salt } = await hashPassword(credentials.password);
  const inserted = await c.env.DB.prepare(
    `INSERT INTO users (username, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT (username) DO NOTHING RETURNING id`
  )
    .bind(credentials.username, hash, salt, new Date().toISOString())
    .first<{ id: number }>();
  if (!inserted) return c.json({ error: "That username is taken." }, 409);
  await startSession(c, inserted.id);
  return c.json({ user: { username: credentials.username } }, 201);
});

authRoutes.post("/auth/login", async (c) => {
  if (await rateLimited(c)) return c.json({ error: "Too many attempts. Try again in a minute." }, 429);
  const credentials = await readCredentials(c);
  const refused = c.json({ error: "Wrong username or password." }, 401);
  if (typeof credentials === "string") return refused;
  const row = await c.env.DB.prepare("SELECT id, username, password_hash, password_salt FROM users WHERE username = ?")
    .bind(credentials.username)
    .first<{ id: number; username: string; password_hash: string; password_salt: string }>();
  if (!row || !(await verifyPassword(credentials.password, row.password_hash, row.password_salt))) return refused;
  await startSession(c, row.id);
  return c.json({ user: { username: row.username } });
});

authRoutes.post("/auth/logout", async (c) => {
  await endSession(c);
  return c.body(null, 204);
});

// Who is logged in. A guest is a normal answer here, not an error.
authRoutes.get("/me", async (c) => {
  const user = await findUser(c);
  if (!user) return c.json({ user: null, stats: null });
  const stats = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(has_bingo), 0) AS bingos, COALESCE(SUM(is_blackout), 0) AS blackouts FROM boards WHERE user_id = ?"
  )
    .bind(user.id)
    .first<{ bingos: number; blackouts: number }>();
  return c.json({ user: { username: user.username }, stats: { bingos: stats?.bingos ?? 0, blackouts: stats?.blackouts ?? 0 } });
});
