import { describe, expect, it } from "vitest";
import { generateBoard } from "../src/board";
import { call, newBoard, signUp, TOP_ROW } from "./testHelpers";

const ALL = Array.from({ length: 25 }, (_, i) => `${Math.floor(i / 5)}-${i % 5}`);

async function stats(cookie: string) {
  return ((await (await call("/api/me", { cookie })).json()) as { stats: unknown }).stats;
}

async function mark(cookie: string, id: string, marks: string[], mode?: string) {
  return call(`/api/boards/${id}`, { method: "PUT", cookie, body: { marks, ...(mode ? { mode } : {}) } });
}

describe("boards", () => {
  it("needs a login", async () => {
    expect((await call("/api/boards/active?sport=baseball")).status).toBe(401);
  });

  it("saves marks and works out bingo on the server", async () => {
    const cookie = await signUp();
    const board = await newBoard(cookie);
    const res = await mark(cookie, board.id, TOP_ROW);
    const saved = ((await res.json()) as { board: Record<string, unknown> }).board;
    expect(saved.hasBingo).toBe(true);
    expect(saved.firstBingoAt).toEqual(expect.any(String));
    expect(await stats(cookie)).toEqual({ bingos: 1, blackouts: 0 });
  });

  it("stops counting a bingo that is unmarked, and keeps the board's latest marks", async () => {
    const cookie = await signUp();
    const board = await newBoard(cookie);
    await mark(cookie, board.id, TOP_ROW);
    await mark(cookie, board.id, ["0-0", "0-1", "0-2", "0-3"]);
    expect(await stats(cookie)).toEqual({ bingos: 0, blackouts: 0 });
    const active = (await (await call("/api/boards/active?sport=baseball", { cookie })).json()) as {
      board: { marks: string[] };
    };
    expect(active.board.marks.sort()).toEqual(["0-0", "0-1", "0-2", "0-3"]);
  });

  it("records a blackout and the choice to go for one", async () => {
    const cookie = await signUp();
    const board = await newBoard(cookie);
    await mark(cookie, board.id, TOP_ROW, "blackout");
    const res = await mark(cookie, board.id, ALL);
    const saved = ((await res.json()) as { board: Record<string, unknown> }).board;
    expect(saved.mode).toBe("blackout");
    expect(saved.isBlackout).toBe(true);
    expect(await stats(cookie)).toEqual({ bingos: 1, blackouts: 1 });
  });

  it("finishes the previous card when a new one starts, and lists only bingos in history", async () => {
    const cookie = await signUp();
    const first = await newBoard(cookie);
    await mark(cookie, first.id, TOP_ROW);
    const second = await newBoard(cookie);
    await newBoard(cookie);
    const history = (await (await call("/api/boards", { cookie })).json()) as { boards: { id: string }[] };
    expect(history.boards.map((b) => b.id)).toEqual([first.id]);
    expect((await mark(cookie, first.id, ALL)).status).toBe(409);
    expect((await mark(cookie, second.id, ALL)).status).toBe(409);
  });

  it("keeps each player's boards private", async () => {
    const owner = await signUp("owner");
    const board = await newBoard(owner);
    const other = await signUp("other");
    expect((await call(`/api/boards/${board.id}`, { cookie: other })).status).toBe(404);
    expect((await mark(other, board.id, TOP_ROW)).status).toBe(404);
  });

  it("rejects malformed cards and marks", async () => {
    const cookie = await signUp();
    const tooSmall = await call("/api/boards", {
      method: "POST",
      cookie,
      body: { sport: "baseball", cells: generateBoard("baseball").slice(0, 4), marks: [] },
    });
    expect(tooSmall.status).toBe(400);
    const wrongSport = await call("/api/boards", {
      method: "POST",
      cookie,
      body: { sport: "football", cells: generateBoard("college"), marks: [] },
    });
    expect(wrongSport.status).toBe(400);
    const board = await newBoard(cookie);
    expect((await mark(cookie, board.id, ["9-9"])).status).toBe(400);
  });
});
