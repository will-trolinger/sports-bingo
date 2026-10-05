import { beforeEach, describe, expect, it } from "vitest";
import { FREE_KEY } from "./board";
import { loadGame, loadSport, saveGame, saveSport } from "./storage";

beforeEach(() => localStorage.clear());

describe("storage", () => {
  it("reads a board saved by the original app under its old keys", () => {
    const board = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ({ name: "Cubs", is_free: false })));
    localStorage.setItem("bingo_board_baseball", JSON.stringify(board));
    localStorage.setItem("bingo_marks_baseball", JSON.stringify(["2-2", "0-1"]));
    const game = loadGame("baseball");
    expect(game.board).toEqual(board);
    expect(game.id).toBeNull();
    expect(game.mode).toBe("playing");
    expect([...game.marks].sort()).toEqual(["0-1", "2-2"]);
  });

  it("deals and stores a fresh board when none is saved", () => {
    const game = loadGame("football");
    expect(game.marks).toEqual(new Set([FREE_KEY]));
    expect(loadGame("football").board).toEqual(game.board);
  });

  it("round-trips a game and the chosen sport", () => {
    const game = loadGame("college");
    saveGame("college", { board: game.board, marks: new Set([FREE_KEY, "1-1"]), id: "abc", mode: "blackout" });
    const loaded = loadGame("college");
    expect(loaded.marks).toEqual(new Set([FREE_KEY, "1-1"]));
    expect(loaded.id).toBe("abc");
    expect(loaded.mode).toBe("blackout");
    saveSport("college");
    expect(loadSport()).toBe("college");
  });

  it("falls back to a fresh board when the stored one is corrupt", () => {
    localStorage.setItem("bingo_board_baseball", "{not json");
    localStorage.setItem("bingo_marks_baseball", "[]");
    expect(loadGame("baseball").board).toHaveLength(5);
  });
});

describe("first-visit welcome", () => {
  it("is remembered once seen", async () => {
    const { hasBeenWelcomed, markWelcomed } = await import("./storage");
    expect(hasBeenWelcomed()).toBe(false);
    markWelcomed();
    expect(hasBeenWelcomed()).toBe(true);
  });
});
