import { FREE_KEY, generateBoard, type Board } from "./board";
import type { Mode } from "./api";
import { isSport, type Sport } from "./teams";

// The keys the original single-file app used, kept so a board in progress
// survives the rewrite.
const SPORT_KEY = "bingo_sport";
const boardKey = (sport: Sport) => `bingo_board_${sport}`;
const marksKey = (sport: Sport) => `bingo_marks_${sport}`;
// Added with accounts: which saved board this card mirrors (none for a
// guest) and whether the player chose to go for blackout.
const idKey = (sport: Sport) => `bingo_id_${sport}`;
const modeKey = (sport: Sport) => `bingo_mode_${sport}`;

export interface Game {
  board: Board;
  marks: ReadonlySet<string>;
  id: string | null;
  mode: Mode;
}

// Storage can throw (private windows, blocked site data), and a game that
// cannot be saved should still be playable.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Playing on without persistence is better than failing the tap.
  }
}

function parseBoard(raw: string | null): Board | null {
  if (!raw) return null;
  try {
    const board = JSON.parse(raw);
    return Array.isArray(board) && board.length === 5 ? (board as Board) : null;
  } catch {
    return null;
  }
}

function parseMarks(raw: string | null): Set<string> | null {
  if (!raw) return null;
  try {
    const marks = JSON.parse(raw);
    return Array.isArray(marks) ? new Set(marks.map(String)) : null;
  } catch {
    return null;
  }
}

export function saveGame(sport: Sport, game: Game): void {
  write(boardKey(sport), JSON.stringify(game.board));
  write(marksKey(sport), JSON.stringify([...game.marks]));
  write(idKey(sport), game.id ?? "");
  write(modeKey(sport), game.mode);
}

export function newGame(sport: Sport): Game {
  const game: Game = { board: generateBoard(sport), marks: new Set([FREE_KEY]), id: null, mode: "playing" };
  saveGame(sport, game);
  return game;
}

export function loadGame(sport: Sport): Game {
  const board = parseBoard(read(boardKey(sport)));
  const marks = parseMarks(read(marksKey(sport)));
  if (!board || !marks) return newGame(sport);
  const mode = read(modeKey(sport)) === "blackout" ? "blackout" : "playing";
  return { board, marks, id: read(idKey(sport)) || null, mode };
}

export function loadSport(): Sport {
  const stored = read(SPORT_KEY);
  return isSport(stored) ? stored : "baseball";
}

export function saveSport(sport: Sport): void {
  write(SPORT_KEY, sport);
}
