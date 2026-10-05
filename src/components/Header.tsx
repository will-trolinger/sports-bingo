import { Link } from "react-router-dom";
import type { Account } from "../api";
import { plural } from "../format";

interface Props {
  account: Account | null;
  loaded: boolean;
  onLogIn: () => void;
}

// Site name on the left; on the right, the player's bingo count (a link to
// their past cards) or a way to log in.
export function Header({ account, loaded, onLogIn }: Props) {
  return (
    <header className="flex h-16 items-center justify-between gap-3">
      <Link to="/" className="font-semibold">
        Sports Bingo
      </Link>
      {loaded &&
        (account ? (
          <Link to="/history" className="flex h-10 items-center rounded-md px-3 text-sm hover:bg-square">
            {plural(account.stats.bingos, "bingo")}
          </Link>
        ) : (
          <button type="button" onClick={onLogIn} className="h-10 rounded-md border border-rule px-4 text-sm hover:bg-square">
            Log in
          </button>
        ))}
    </header>
  );
}
