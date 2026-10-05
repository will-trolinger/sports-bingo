import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHistory, type Account, type SavedBoard } from "../api";
import { BoardThumb } from "../components/BoardThumb";
import { formatDate, plural, sportLabel } from "../format";

interface Props {
  account: Account | null;
  onLogIn: () => void;
  onLogOut: () => void;
}

// The player's bingos, newest first, each opening the card as it ended.
export function HistoryPage({ account, onLogIn, onLogOut }: Props) {
  const [boards, setBoards] = useState<SavedBoard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    fetchHistory()
      .then(setBoards)
      .catch((err: Error) => setError(err.message));
  }, [account]);

  if (!account) {
    return (
      <div className="mt-6">
        <h1 className="text-4xl font-light">My bingos</h1>
        <p className="mt-3 text-ink-dim">Log in to see the bingos you've saved.</p>
        <button type="button" onClick={onLogIn} className="mt-5 h-11 w-full rounded-md bg-ink px-5 text-sm font-semibold text-page sm:w-auto">
          Log in
        </button>
      </div>
    );
  }

  const { bingos, blackouts } = account.stats;
  return (
    <div className="mt-2">
      <h1 className="text-4xl font-light">My bingos</h1>
      <p className="mt-2 text-ink-dim">
        {account.user.username} · {plural(bingos, "bingo")}
        {blackouts > 0 && ` · ${plural(blackouts, "blackout")}`}
      </p>

      {error && <p className="mt-6 text-error">{error}</p>}
      {boards && boards.length === 0 && <p className="mt-6 text-ink-dim">No bingos yet. Your first one will show up here.</p>}
      {boards && boards.length > 0 && (
        <ul className="mt-6 divide-y divide-rule border-y border-rule">
          {boards.map((board) => (
            <li key={board.id}>
              <Link to={`/history/${board.id}`} className="flex items-center gap-4 py-3 hover:bg-square">
                <BoardThumb marks={new Set(board.marks)} />
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold">{formatDate(board.firstBingoAt)}</span>
                  <span className="text-sm text-ink-dim">
                    {sportLabel(board.sport)} · {board.isBlackout ? "Blackout" : "Bingo"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={onLogOut} className="mt-8 h-11 text-sm text-ink-dim underline hover:text-ink">
        Log out
      </button>
    </div>
  );
}
