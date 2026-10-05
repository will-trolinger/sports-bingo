import { cellKey, completedLines, isBlackout, type Board } from "../src/board";
import { isSport, TEAMS, type Sport } from "../src/teams";

export type Mode = "playing" | "blackout";

export interface BoardRow {
  id: string;
  sport: string;
  cells: string;
  marks: string;
  mode: string;
  has_bingo: number;
  is_blackout: number;
  first_bingo_at: string | null;
  blackout_at: string | null;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
}

// What the API returns: the row with JSON decoded and flags as booleans.
export function toApiBoard(row: BoardRow) {
  return {
    id: row.id,
    sport: row.sport,
    cells: JSON.parse(row.cells) as Board,
    marks: JSON.parse(row.marks) as string[],
    mode: row.mode as Mode,
    hasBingo: row.has_bingo === 1,
    isBlackout: row.is_blackout === 1,
    firstBingoAt: row.first_bingo_at,
    blackoutAt: row.blackout_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    finishedAt: row.finished_at,
  };
}

export function parseSport(value: unknown): Sport | null {
  return typeof value === "string" && isSport(value) ? value : null;
}

// A card must be the 5x5 shape the client deals: FREE in the middle and 24
// distinct teams from the chosen sport.
export function parseCells(value: unknown, sport: Sport): Board | null {
  if (!Array.isArray(value) || value.length !== 5) return null;
  const names: string[] = [];
  for (let r = 0; r < 5; r++) {
    const row = value[r];
    if (!Array.isArray(row) || row.length !== 5) return null;
    for (let c = 0; c < 5; c++) {
      const cell = row[c];
      const center = r === 2 && c === 2;
      if (center) {
        if (!cell?.is_free) return null;
      } else if (cell?.is_free || typeof cell?.name !== "string" || !(cell.name in TEAMS[sport])) {
        return null;
      } else {
        names.push(cell.name);
      }
    }
  }
  if (new Set(names).size !== 24) return null;
  return value.map((row: Board[number], r: number) =>
    row.map((cell, c) => (r === 2 && c === 2 ? { name: "FREE", is_free: true } : { name: cell.name, is_free: false }))
  );
}

const VALID_KEYS = new Set(Array.from({ length: 25 }, (_, i) => cellKey(Math.floor(i / 5), i % 5)));

export function parseMarks(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 25) return null;
  if (!value.every((key) => typeof key === "string" && VALID_KEYS.has(key))) return null;
  return [...new Set(value as string[])];
}

export function parseMode(value: unknown): Mode | null | undefined {
  if (value === undefined) return undefined;
  return value === "playing" || value === "blackout" ? value : null;
}

// Worked out here from the saved marks, never taken from the browser.
export function scoreMarks(marks: string[]): { hasBingo: boolean; isBlackout: boolean } {
  const set = new Set(marks);
  return { hasBingo: completedLines(set).length > 0, isBlackout: isBlackout(set) };
}
