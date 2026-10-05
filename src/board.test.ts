import { describe, expect, it } from "vitest";
import { FREE_KEY, cellKey, completedLines, generateBoard, isBlackout } from "./board";
import { TEAMS } from "./teams";

function allKeys(): Set<string> {
  const keys = new Set<string>();
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) keys.add(cellKey(r, c));
  return keys;
}

describe("generateBoard", () => {
  it("makes a 5x5 board with FREE in the middle and 24 distinct teams", () => {
    const board = generateBoard("baseball");
    expect(board).toHaveLength(5);
    board.forEach((row) => expect(row).toHaveLength(5));
    expect(board[2][2]).toEqual({ name: "FREE", is_free: true });
    const names = board.flat().filter((cell) => !cell.is_free).map((cell) => cell.name);
    expect(names).toHaveLength(24);
    expect(new Set(names).size).toBe(24);
    names.forEach((name) => expect(TEAMS.baseball).toHaveProperty(name));
  });
});

describe("completedLines", () => {
  it("finds nothing with only the free square", () => {
    expect(completedLines(new Set([FREE_KEY]))).toEqual([]);
  });

  it("finds a row, a column and both diagonals", () => {
    const row = new Set(["1-0", "1-1", "1-2", "1-3", "1-4"]);
    expect(completedLines(row)).toEqual(["row-1"]);
    const column = new Set(["0-3", "1-3", "2-3", "3-3", "4-3"]);
    expect(completedLines(column)).toEqual(["col-3"]);
    const diagonals = new Set(["0-0", "1-1", "2-2", "3-3", "4-4", "0-4", "1-3", "3-1", "4-0"]);
    expect(completedLines(diagonals)).toEqual(["diag-down", "diag-up"]);
  });

  it("counts the free square toward a line through the middle", () => {
    const marks = new Set([FREE_KEY, "2-0", "2-1", "2-3", "2-4"]);
    expect(completedLines(marks)).toEqual(["row-2"]);
  });
});

describe("isBlackout", () => {
  it("is true only when every square is marked", () => {
    const keys = allKeys();
    expect(isBlackout(keys)).toBe(true);
    keys.delete("4-4");
    expect(isBlackout(keys)).toBe(false);
  });
});
