import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBoard, type SavedBoard } from "../api";
import { BingoBoard } from "../components/BingoBoard";
import { formatDate, sportLabel } from "../format";

// One past card, exactly as it was left.
export function BoardPage() {
  const { id = "" } = useParams();
  const [board, setBoard] = useState<SavedBoard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoard(id)
      .then(setBoard)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  return (
    <div className="mt-2">
      <Link to="/history" className="text-sm text-ink-dim hover:text-ink">
        ‹ My bingos
      </Link>
      {error && <p className="mt-6 text-error">{error}</p>}
      {board && (
        <>
          <h1 className="mt-3 text-3xl font-light">{formatDate(board.firstBingoAt)}</h1>
          <p className="mt-1 mb-4 text-ink-dim">
            {sportLabel(board.sport)} · {board.isBlackout ? "Blackout" : "Bingo"}
          </p>
          <BingoBoard sport={board.sport} board={board.cells} marks={new Set(board.marks)} />
        </>
      )}
    </div>
  );
}
