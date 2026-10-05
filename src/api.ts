import type { Board } from "./board";
import type { Sport } from "./teams";

export type Mode = "playing" | "blackout";

export interface Account {
  user: { username: string };
  stats: { bingos: number; blackouts: number };
}

export interface SavedBoard {
  id: string;
  sport: Sport;
  cells: Board;
  marks: string[];
  mode: Mode;
  hasBingo: boolean;
  isBlackout: boolean;
  firstBingoAt: string | null;
  blackoutAt: string | null;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

// A refusal from the server, carrying its plain-sentence message.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: init.body ? { "content-type": "application/json" } : undefined,
    credentials: "same-origin",
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? "Something went wrong. Try again.");
  return body as T;
}

const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

// Null when nobody is logged in.
export async function fetchAccount(): Promise<Account | null> {
  const me = await request<Account | { user: null }>("/me");
  return me.user ? (me as Account) : null;
}

export const signUp = (username: string, password: string) =>
  request<{ user: { username: string } }>("/auth/signup", send("POST", { username, password }));

export const logIn = (username: string, password: string) =>
  request<{ user: { username: string } }>("/auth/login", send("POST", { username, password }));

export const logOut = () => request<void>("/auth/logout", send("POST"));

export const fetchActiveBoard = (sport: Sport) =>
  request<{ board: SavedBoard | null }>(`/boards/active?sport=${sport}`).then((r) => r.board);

export const createBoard = (sport: Sport, cells: Board, marks: string[]) =>
  request<{ board: SavedBoard }>("/boards", send("POST", { sport, cells, marks })).then((r) => r.board);

export const updateBoard = (id: string, marks: string[], mode: Mode) =>
  request<{ board: SavedBoard }>(`/boards/${id}`, send("PUT", { marks, mode })).then((r) => r.board);

// Sent as the page is hidden or closed: keepalive lets the save finish even
// if the tab does not.
export function updateBoardOnExit(id: string, marks: string[], mode: Mode): void {
  void fetch(`/api/boards/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ marks, mode }),
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
}

export const fetchHistory = () => request<{ boards: SavedBoard[] }>("/boards").then((r) => r.boards);

export const fetchBoard = (id: string) => request<{ board: SavedBoard }>(`/boards/${id}`).then((r) => r.board);

export const deleteBoard = (id: string) => request<void>(`/boards/${id}`, send("DELETE"));
