import { describe, expect, it } from "vitest";
import { call, sessionCookie, signUp } from "./testHelpers";

describe("accounts", () => {
  it("signs up, sets a year-long HttpOnly session cookie, and reports the user", async () => {
    const res = await call("/api/auth/signup", { method: "POST", body: { username: "Will", password: "correct horse" } });
    expect(res.status).toBe(201);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Max-Age=31536000/);
    expect(cookie).toMatch(/SameSite=Lax/i);
    const me = await call("/api/me", { cookie: sessionCookie(res) });
    expect(await me.json()).toEqual({ user: { username: "Will" }, stats: { bingos: 0, blackouts: 0 } });
  });

  it("gives usernames out first come, first served, ignoring case", async () => {
    await signUp("Will");
    const res = await call("/api/auth/signup", { method: "POST", body: { username: "will", password: "another one" } });
    expect(res.status).toBe(409);
  });

  it("rejects a bad username or a short password", async () => {
    const badName = await call("/api/auth/signup", { method: "POST", body: { username: "a b", password: "long enough" } });
    expect(badName.status).toBe(400);
    const shortPassword = await call("/api/auth/signup", { method: "POST", body: { username: "will", password: "short" } });
    expect(shortPassword.status).toBe(400);
  });

  it("logs in with the right password only", async () => {
    await signUp("will", "correct horse");
    const wrong = await call("/api/auth/login", { method: "POST", body: { username: "will", password: "wrong guess" } });
    expect(wrong.status).toBe(401);
    const unknown = await call("/api/auth/login", { method: "POST", body: { username: "nobody", password: "correct horse" } });
    expect(unknown.status).toBe(401);
    const right = await call("/api/auth/login", { method: "POST", body: { username: "WILL", password: "correct horse" } });
    expect(right.status).toBe(200);
    expect((await call("/api/me", { cookie: sessionCookie(right) })).status).toBe(200);
  });

  it("ends the session on logout", async () => {
    const cookie = await signUp();
    expect((await call("/api/auth/logout", { method: "POST", cookie })).status).toBe(204);
    expect((await call("/api/me", { cookie })).status).toBe(401);
  });

  it("refuses requests from another site", async () => {
    const res = await call("/api/auth/signup", {
      method: "POST",
      origin: "https://evil.example",
      body: { username: "will", password: "correct horse" },
    });
    expect(res.status).toBe(403);
  });
});
