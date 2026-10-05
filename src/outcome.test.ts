import { describe, expect, it } from "vitest";
import { outcomeOfToggle } from "./outcome";

const ROW = ["2-2", "0-0", "0-1", "0-2", "0-3", "0-4"];
const ROW_MINUS_ONE = ["2-2", "0-0", "0-1", "0-2", "0-3"];
const ALL = Array.from({ length: 25 }, (_, i) => `${Math.floor(i / 5)}-${i % 5}`);
const ALL_MINUS_ONE = ALL.slice(0, 24);

const s = (keys: string[]) => new Set(keys);

describe("outcomeOfToggle", () => {
  it("does nothing for an ordinary tap", () => {
    expect(outcomeOfToggle(s(["2-2"]), s(["2-2", "1-1"]), "playing")).toEqual({ celebrate: false, prompt: null });
  });

  it("celebrates and asks what next on the first bingo", () => {
    expect(outcomeOfToggle(s(ROW_MINUS_ONE), s(ROW), "playing")).toEqual({ celebrate: true, prompt: "bingo" });
  });

  it("asks again after a bingo was unmarked and a new one made", () => {
    expect(outcomeOfToggle(s(ROW_MINUS_ONE), s(ROW), "playing").prompt).toBe("bingo");
  });

  it("only celebrates new lines once the player is going for blackout", () => {
    const withRow = [...ROW, "1-0", "2-0", "3-0"];
    expect(outcomeOfToggle(s(withRow), s([...withRow, "4-0"]), "blackout")).toEqual({ celebrate: true, prompt: null });
  });

  it("does not ask again for a second line while a bingo already stands", () => {
    const withRow = [...ROW, "1-0", "2-0", "3-0"];
    expect(outcomeOfToggle(s(withRow), s([...withRow, "4-0"]), "playing")).toEqual({ celebrate: true, prompt: null });
  });

  it("calls a blackout when the last square is marked", () => {
    expect(outcomeOfToggle(s(ALL_MINUS_ONE), s(ALL), "blackout")).toEqual({ celebrate: true, prompt: "blackout" });
  });
});
