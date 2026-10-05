import { useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { AccountDialog } from "./components/AccountDialog";
import { Header } from "./components/Header";
import { WelcomeDialog } from "./components/WelcomeDialog";
import { BoardPage } from "./pages/BoardPage";
import { GamePage } from "./pages/GamePage";
import { HistoryPage } from "./pages/HistoryPage";
import { hasBeenWelcomed, markWelcomed } from "./storage";
import { useAccount } from "./useAccount";

function Layout() {
  const { account, loaded, refresh, enter, leave } = useAccount();
  const [accountKind, setAccountKind] = useState<"login" | "signup" | null>(null);
  const [welcomed, setWelcomed] = useState(hasBeenWelcomed);
  const navigate = useNavigate();
  // Once the account check is back, so a logged-in player never sees it.
  const showWelcome = loaded && !account && !welcomed;

  function finishWelcome(next: "login" | "signup" | null) {
    markWelcomed();
    setWelcomed(true);
    setAccountKind(next);
  }

  async function logOut() {
    await leave();
    navigate("/");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-10">
      <Header account={account} loaded={loaded} onLogIn={() => setAccountKind("login")} />
      <Routes>
        <Route path="/" element={<GamePage loggedIn={account !== null} onSaved={refresh} />} />
        <Route
          path="/history"
          element={<HistoryPage account={account} onLogIn={() => setAccountKind("login")} onLogOut={logOut} />}
        />
        <Route path="/history/:id" element={<BoardPage onDeleted={refresh} />} />
      </Routes>
      <WelcomeDialog open={showWelcome} onGuest={() => finishWelcome(null)} onAccount={finishWelcome} />
      <AccountDialog
        open={accountKind !== null}
        initialKind={accountKind ?? "login"}
        onClose={() => setAccountKind(null)}
        onSubmit={enter}
      />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
