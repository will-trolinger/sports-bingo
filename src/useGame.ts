import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { ApiError, createBoard, fetchActiveBoard, updateBoard, updateBoardOnExit, type SavedBoard } from "./api";
import { generateBoard, FREE_KEY } from "./board";
import { outcomeOfToggle, type Outcome } from "./outcome";
import { loadGame, saveGame, type Game } from "./storage";
import type { Sport } from "./teams";

// Taps within this long of each other are saved together.
const SAVE_DELAY_MS = 900;

function fromSaved(board: SavedBoard): Game {
  return { board: board.cells, marks: new Set(board.marks), id: board.id, mode: board.mode };
}

function celebrate(): void {
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

// One sport's card. A guest's lives in this browser; a logged-in player's is
// mirrored to their account, which wins when the two differ (another device
// may have played on). onSaved runs after the server confirms a save, so the
// bingo count can refresh.
export function useGame(sport: Sport, loggedIn: boolean, onSaved: () => void) {
  const [game, setGame] = useState<Game>(() => loadGame(sport));
  const [prompt, setPrompt] = useState<Outcome["prompt"]>(null);
  const latest = useRef(game);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);
  // Whether the last confirmed save had a bingo or blackout, so the count is
  // only refreshed when that changes.
  const scored = useRef("");

  const show = useCallback(
    (next: Game) => {
      latest.current = next;
      saveGame(sport, next);
      setGame(next);
    },
    [sport]
  );

  // Ties the local card to the account: the account's card if it has one,
  // otherwise this browser's card moves into the account.
  const attach = useCallback(async () => {
    const local = loadGame(sport);
    show(local);
    if (!loggedIn) return;
    try {
      const remote = await fetchActiveBoard(sport);
      show(fromSaved(remote ?? (await createBoard(sport, local.board, [...local.marks]))));
    } catch {
      // Keep playing locally; the next save tries again.
    }
  }, [sport, loggedIn, show]);

  useEffect(() => {
    void attach();
  }, [attach]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const current = latest.current;
    if (!loggedIn || !dirty.current) return;
    dirty.current = false;
    try {
      const saved = current.id
        ? await updateBoard(current.id, [...current.marks], current.mode)
        : await createBoard(sport, current.board, [...current.marks]);
      if (!current.id) show({ ...latest.current, id: saved.id });
      const flags = `${saved.hasBingo}/${saved.isBlackout}`;
      if (flags !== scored.current) onSaved();
      scored.current = flags;
    } catch (error) {
      // Finished or missing on the server (another device started a new
      // card): load the account's current card. Otherwise offline: retry on
      // the next change.
      if (error instanceof ApiError && (error.status === 404 || error.status === 409)) void attach();
      else dirty.current = true;
    }
  }, [loggedIn, sport, show, onSaved, attach]);

  const schedule = useCallback(() => {
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
  }, [flush]);

  // A save still waiting when the tab is hidden or closed goes out at once.
  useEffect(() => {
    const onHide = () => {
      const current = latest.current;
      if (document.visibilityState !== "hidden" || !dirty.current || !loggedIn || !current.id) return;
      dirty.current = false;
      updateBoardOnExit(current.id, [...current.marks], current.mode);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [loggedIn]);

  const toggle = useCallback(
    (key: string) => {
      const before = latest.current;
      const marks = new Set(before.marks);
      if (marks.has(key)) marks.delete(key);
      else marks.add(key);
      const outcome = outcomeOfToggle(before.marks, marks, before.mode);
      show({ ...before, marks });
      // A new line or a blackout saves at once: the popup says it is saved.
      if (outcome.celebrate) {
        dirty.current = true;
        void flush();
      } else {
        schedule();
      }
      if (outcome.celebrate) celebrate();
      if (outcome.prompt) setPrompt(outcome.prompt);
    },
    [show, schedule, flush]
  );

  const goForBlackout = useCallback(() => {
    show({ ...latest.current, mode: "blackout" });
    setPrompt(null);
    schedule();
  }, [show, schedule]);

  // Saves the card as it stands and deals a new one.
  const newCard = useCallback(async () => {
    setPrompt(null);
    await flush();
    const fresh: Game = { board: generateBoard(sport), marks: new Set([FREE_KEY]), id: null, mode: "playing" };
    show(fresh);
    if (!loggedIn) return;
    try {
      show(fromSaved(await createBoard(sport, fresh.board, [...fresh.marks])));
    } catch {
      dirty.current = true;
    }
  }, [flush, show, sport, loggedIn]);

  return { game, prompt, toggle, goForBlackout, newCard, dismissPrompt: () => setPrompt(null) };
}
