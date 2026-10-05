import { useState, type FormEvent } from "react";
import { Modal, primaryButton } from "./Modal";

type Kind = "login" | "signup";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (kind: Kind, username: string, password: string) => Promise<void>;
}

// Inputs are 16px: anything smaller makes iOS zoom the page on focus.
const input =
  "h-12 w-full rounded-md border border-rule bg-page px-3 text-base outline-none focus:border-ink";

export function AccountDialog({ open, onClose, onSubmit }: Props) {
  const [kind, setKind] = useState<Kind>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(kind, username.trim(), password);
      setPassword("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-5 flex divide-x divide-rule overflow-hidden rounded-md border border-rule" role="tablist">
        {(["login", "signup"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => {
              setKind(k);
              setError(null);
            }}
            className={`h-10 flex-1 text-sm ${kind === k ? "bg-ink font-semibold text-page" : "text-ink-dim"}`}
          >
            {k === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Username
          <input
            className={input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            className={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={kind === "login" ? "current-password" : "new-password"}
            minLength={kind === "signup" ? 8 : undefined}
            required
          />
        </label>
        {kind === "signup" && (
          <p className="text-xs text-ink-dim">There's no password reset, so pick one you'll remember.</p>
        )}
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={`${primaryButton} mt-1`}>
          {kind === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </Modal>
  );
}
