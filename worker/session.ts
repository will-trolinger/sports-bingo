import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { AppEnv, User } from "./types";

const COOKIE = "session";
const DAY_MS = 24 * 60 * 60 * 1000;
// Logged in for a year, renewed whenever the player is active, so only a
// year away (or a new device) means logging in again.
const SESSION_DAYS = 365;
// Renew once the session is a month old rather than writing on every request.
const RENEW_AFTER_DAYS = 30;

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
}

function expiresFromNow(): string {
  return new Date(Date.now() + SESSION_DAYS * DAY_MS).toISOString();
}

function writeCookie(c: Context<AppEnv>, token: string): void {
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    // Plain http only happens in local development.
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_DAYS * DAY_MS / 1000,
  });
}

export async function startSession(c: Context<AppEnv>, userId: number): Promise<void> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, (ch) => ({ "+": "-", "/": "_", "=": "" })[ch]!);
  await c.env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await hashToken(token), userId, expiresFromNow())
    .run();
  writeCookie(c, token);
}

export async function endSession(c: Context<AppEnv>): Promise<void> {
  const token = getCookie(c, COOKIE);
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await hashToken(token)).run();
  deleteCookie(c, COOKIE, { path: "/" });
}

export async function findUser(c: Context<AppEnv>): Promise<User | null> {
  const token = getCookie(c, COOKIE);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const row = await c.env.DB.prepare(
    `SELECT users.id, users.username, sessions.expires_at FROM sessions
     JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ?`
  )
    .bind(tokenHash)
    .first<{ id: number; username: string; expires_at: string }>();
  if (!row) return null;
  const expires = Date.parse(row.expires_at);
  if (expires <= Date.now()) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }
  if (expires - Date.now() < (SESSION_DAYS - RENEW_AFTER_DAYS) * DAY_MS) {
    await c.env.DB.prepare("UPDATE sessions SET expires_at = ? WHERE token_hash = ?")
      .bind(expiresFromNow(), tokenHash)
      .run();
    writeCookie(c, token);
  }
  return { id: row.id, username: row.username };
}

export const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = await findUser(c);
  if (!user) return c.json({ error: "Log in to save your bingos." }, 401);
  c.set("user", user);
  await next();
};
