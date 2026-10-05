import { Modal, primaryButton, secondaryButton } from "./Modal";

interface Props {
  open: boolean;
  onGuest: () => void;
  onAccount: (kind: "login" | "signup") => void;
}

// Shown once, on a browser's first visit. Closing it counts as playing as a
// guest.
export function WelcomeDialog({ open, onGuest, onAccount }: Props) {
  return (
    <Modal open={open} onClose={onGuest}>
      <h2 className="text-2xl font-semibold">Sports Bingo</h2>
      <p className="mt-2 text-sm text-ink-dim">Log in to keep a record of your bingos, or just play.</p>
      <div className="mt-5 flex flex-col gap-2">
        <button type="button" onClick={onGuest} className={primaryButton} data-autofocus>
          Play as guest
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onAccount("login")} className={secondaryButton}>
            Log in
          </button>
          <button type="button" onClick={() => onAccount("signup")} className={secondaryButton}>
            Sign up
          </button>
        </div>
      </div>
    </Modal>
  );
}
