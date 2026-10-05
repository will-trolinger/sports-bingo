import { TEAMS, type Sport } from "./teams";

// The same shapes the original app stored in localStorage: rows of cells,
// and marks as "row-col" strings.
export interface Cell {
  name: string;
  is_free: boolean;
}

export type Board = Cell[][];

const SIZE = 5;
const CENTER = 2;
export const FREE_KEY = `${CENTER}-${CENTER}`;

export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateBoard(sport: Sport): Board {
  const teams = shuffle(Object.keys(TEAMS[sport])).slice(0, SIZE * SIZE - 1);
  let next = 0;
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) =>
      row === CENTER && col === CENTER
        ? { name: "FREE", is_free: true }
        : { name: teams[next++], is_free: false }
    )
  );
}

// Every line on the board, named so a completed one can be reported and,
// later, highlighted.
const LINES: { id: string; keys: string[] }[] = [
  ...Array.from({ length: SIZE }, (_, r) => ({
    id: `row-${r}`,
    keys: Array.from({ length: SIZE }, (_, c) => cellKey(r, c)),
  })),
  ...Array.from({ length: SIZE }, (_, c) => ({
    id: `col-${c}`,
    keys: Array.from({ length: SIZE }, (_, r) => cellKey(r, c)),
  })),
  { id: "diag-down", keys: Array.from({ length: SIZE }, (_, i) => cellKey(i, i)) },
  { id: "diag-up", keys: Array.from({ length: SIZE }, (_, i) => cellKey(i, SIZE - 1 - i)) },
];

// The free square always counts, whether or not it is in the stored marks.
function isMarked(marks: ReadonlySet<string>, key: string): boolean {
  return key === FREE_KEY || marks.has(key);
}

export function completedLines(marks: ReadonlySet<string>): string[] {
  return LINES.filter((line) => line.keys.every((key) => isMarked(marks, key))).map((line) => line.id);
}

export function isBlackout(marks: ReadonlySet<string>): boolean {
  return LINES.every((line) => line.keys.every((key) => isMarked(marks, key)));
}
