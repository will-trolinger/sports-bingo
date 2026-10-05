import { useState } from "react";
import { BingoBoard } from "../components/BingoBoard";
import { BingoPrompt } from "../components/BingoPrompt";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SportPicker } from "../components/SportPicker";
import { sportLabel } from "../format";
import { loadSport, saveSport } from "../storage";
import { isSport, type Sport } from "../teams";
import { useGame } from "../useGame";

// A ?sport= link (the original app supported these) picks the board to open.
function initialSport(): Sport {
  const param = new URLSearchParams(window.location.search).get("sport");
  if (isSport(param)) {
    saveSport(param);
    return param;
  }
  return loadSport();
}

interface Props {
  loggedIn: boolean;
  onSaved: () => void;
}

export function GamePage({ loggedIn, onSaved }: Props) {
  const [sport, setSport] = useState<Sport>(initialSport);
  const [confirmingNew, setConfirmingNew] = useState(false);
  const { game, prompt, toggle, goForBlackout, newCard, dismissPrompt } = useGame(sport, loggedIn, onSaved);

  function changeSport(next: Sport) {
    saveSport(next);
    setSport(next);
  }

  return (
    <>
      {/* The switch already shows the sport; the heading is for screen readers. */}
      <h1 className="sr-only">{sportLabel(sport)} Bingo</h1>
      <SportPicker sport={sport} onChange={changeSport} />
      <div className="mt-4">
        <BingoBoard sport={sport} board={game.board} marks={game.marks} onToggle={toggle} />
      </div>

      <button
        type="button"
        onClick={() => setConfirmingNew(true)}
        className="mt-6 h-11 w-full self-center rounded-md border border-rule px-6 text-sm hover:bg-square sm:w-auto"
      >
        Generate New Card
      </button>

      <ConfirmDialog
        open={confirmingNew}
        title="Generate a new card?"
        body={loggedIn ? "This card is saved as it stands." : "Your current board and marks will be lost."}
        confirmLabel="New card"
        onConfirm={() => {
          setConfirmingNew(false);
          void newCard();
        }}
        onCancel={() => setConfirmingNew(false)}
      />
      <BingoPrompt
        kind={prompt}
        loggedIn={loggedIn}
        onNewCard={() => void newCard()}
        onBlackout={goForBlackout}
        onClose={dismissPrompt}
      />
    </>
  );
}
