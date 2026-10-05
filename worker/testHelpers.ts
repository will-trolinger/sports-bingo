import { exports } from "cloudflare:workers";
import { generateBoard } from "../src/board";

export const ORIGIN = "https://bingo.test";

// Each test gets its own client IP, so the per-IP sign-up limit (10 a
// minute) is counted per test rather than across a whole file.
let clientIp = "203.0.113.0";
let ipCounter = 0;
export function useFreshClientIp(): void {
  ipCounter += 1;
  clientIp = `203.0.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`;
}

interface Options {
  method?: string;
  body?: unknown;
  cookie?: string;
  origin?: string;
}

// Calls the Worker the way a browser on this site would: same origin, JSON.
export function call(path: string, { method = "GET", body, cookie, origin = ORIGIN }: Options = {}) {
  const headers: Record<string, string> = { origin, "cf-connecting-ip": clientIp };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return exports.default.fetch(`${ORIGIN}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function sessionCookie(res: Response): string {
  const header = res.headers.get("set-cookie") ?? "";
  return header.split(";")[0];
}

export async function signUp(username = "will", password = "correct horse"): Promise<string> {
  const res = await call("/api/auth/signup", { method: "POST", body: { username, password } });
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${await res.text()}`);
  return sessionCookie(res);
}

export async function newBoard(cookie: string, sport = "baseball") {
  const res = await call("/api/boards", {
    method: "POST",
    cookie,
    body: { sport, cells: generateBoard("baseball"), marks: ["2-2"] },
  });
  if (res.status !== 201) throw new Error(`board create failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { board: { id: string } }).board;
}

export const TOP_ROW = ["0-0", "0-1", "0-2", "0-3", "0-4"];
