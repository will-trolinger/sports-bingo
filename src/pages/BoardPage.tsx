import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteBoard, fetchBoard, type SavedBoard } from "../api";
import { BingoBoard } from "../components/BingoBoard";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { formatDate, sportLabel } from "../format";
import { loadGame, newGame } from "../storage";

interface Props {
  // Runs after a delete so the bingo count refreshes.
  onDeleted: () => void;
}

// One past card, exactly as it was left, with a way to delete it.
export function BoardPage({ onDeleted }: Props) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<SavedBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchBoard(id)
      .then(setBoard)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  // The card being played in this browser is the same board; deal a fresh
  // one so the deleted card is not saved again on the next tap.
  const inPlayHere = board !== null && loadGame(board.sport).id === board.id;

  async function remove() {
    if (!board) return;
    setConfirming(false);
    try {
      await deleteBoard(board.id);
      if (inPlayHere) newGame(board.sport);
      onDeleted();
      navigate("/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <div className="mt-2">
      <Link to="/history" className="-ml-1 inline-flex h-11 items-center px-1 text-sm text-ink-dim hover:text-ink">
        ‹ My bingos
      </Link>
      {error && <p className="mt-6 text-error">{error}</p>}
      {board && (
        <>
          <h1 className="mt-1 text-3xl font-light">{formatDate(board.firstBingoAt)}</h1>
          <p className="mt-1 mb-4 text-ink-dim">
            {sportLabel(board.sport)} · {board.isBlackout ? "Blackout" : "Bingo"}
          </p>
          <BingoBoard sport={board.sport} board={board.cells} marks={new Set(board.marks)} />
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-6 h-11 w-full rounded-md border border-rule px-6 text-sm text-error hover:bg-square sm:w-auto"
          >
            Delete this bingo
          </button>
          <ConfirmDialog
            open={confirming}
            title="Delete this bingo?"
            body={
              inPlayHere
                ? "This is the card you're playing now, so you'll get a fresh card. This can't be undone."
                : "It will be removed from your bingos. This can't be undone."
            }
            confirmLabel="Delete"
            onConfirm={() => void remove()}
            onCancel={() => setConfirming(false)}
          />
        </>
      )}
    </div>
  );
}
