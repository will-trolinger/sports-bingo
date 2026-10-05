import { useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { AccountDialog } from "./components/AccountDialog";
import { Header } from "./components/Header";
import { BoardPage } from "./pages/BoardPage";
import { GamePage } from "./pages/GamePage";
import { HistoryPage } from "./pages/HistoryPage";
import { useAccount } from "./useAccount";

function Layout() {
  const { account, loaded, refresh, enter, leave } = useAccount();
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();

  async function logOut() {
    await leave();
    navigate("/");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-10">
      <Header account={account} loaded={loaded} onLogIn={() => setLoggingIn(true)} />
      <Routes>
        <Route path="/" element={<GamePage loggedIn={account !== null} onSaved={refresh} />} />
        <Route
          path="/history"
          element={<HistoryPage account={account} onLogIn={() => setLoggingIn(true)} onLogOut={logOut} />}
        />
        <Route path="/history/:id" element={<BoardPage />} />
      </Routes>
      <AccountDialog open={loggingIn} onClose={() => setLoggingIn(false)} onSubmit={enter} />
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
