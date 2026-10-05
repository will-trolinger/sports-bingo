import { useState } from "react";
import confetti from "canvas-confetti";
import { completedLines } from "./board";
import { BingoBoard } from "./components/BingoBoard";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { SportPicker } from "./components/SportPicker";
import { loadGame, loadSport, newGame, saveGame, saveSport, type Game } from "./storage";
import { isSport, SPORTS, type Sport } from "./teams";

// A ?sport= link (the original app supported these) picks the board to open.
function initialSport(): Sport {
  const param = new URLSearchParams(window.location.search).get("sport");
  if (isSport(param)) {
    saveSport(param);
    return param;
  }
  return loadSport();
}

function celebrate(): void {
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

export function App() {
  const [sport, setSport] = useState<Sport>(initialSport);
  const [game, setGame] = useState<Game>(() => loadGame(sport));
  const [confirmingNew, setConfirmingNew] = useState(false);
  const label = SPORTS.find((s) => s.id === sport)?.label ?? "";

  function changeSport(next: Sport) {
    saveSport(next);
    setSport(next);
    setGame(loadGame(next));
  }

  function toggle(key: string) {
    const marks = new Set(game.marks);
    if (marks.has(key)) marks.delete(key);
    else marks.add(key);
    const next = { board: game.board, marks };
    saveGame(sport, next);
    setGame(next);
    // Celebrate each newly completed line, not every tap while one stands.
    if (completedLines(marks).length > completedLines(game.marks).length) celebrate();
  }

  function startNewCard() {
    setGame(newGame(sport));
    setConfirmingNew(false);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3 py-5">
        <span className="font-semibold">Sports Bingo</span>
        <SportPicker sport={sport} onChange={changeSport} />
      </header>

      <h1 className="mb-4 text-4xl font-light sm:text-5xl">{label} Bingo</h1>

      <BingoBoard sport={sport} board={game.board} marks={game.marks} onToggle={toggle} />

      <button
        type="button"
        onClick={() => setConfirmingNew(true)}
        className="mt-5 h-11 self-start rounded-md border border-rule px-5 text-sm hover:border-chalk-dim"
      >
        Generate New Card
      </button>

      <ConfirmDialog
        open={confirmingNew}
        title="Generate a new card?"
        body="Your current board and marks will be lost."
        confirmLabel="New card"
        onConfirm={startNewCard}
        onCancel={() => setConfirmingNew(false)}
      />
    </div>
  );
}
