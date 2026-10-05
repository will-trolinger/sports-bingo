import { useCallback, useEffect, useState } from "react";
import { fetchAccount, logIn, logOut, signUp, type Account } from "./api";

// Who is logged in, and their bingo and blackout counts.
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setAccount(await fetchAccount());
    } catch {
      // Offline or the server is down: play on as a guest until it answers.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enter = useCallback(
    async (kind: "login" | "signup", username: string, password: string) => {
      await (kind === "login" ? logIn(username, password) : signUp(username, password));
      await refresh();
    },
    [refresh]
  );

  const leave = useCallback(async () => {
    await logOut();
    setAccount(null);
  }, []);

  return { account, loaded, refresh, enter, leave };
}
