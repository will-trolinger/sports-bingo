import { Modal, primaryButton, secondaryButton } from "./Modal";

interface Props {
  kind: "bingo" | "blackout" | null;
  loggedIn: boolean;
  onNewCard: () => void;
  onBlackout: () => void;
  onClose: () => void;
}

// Asked on a bingo (new card, or keep going for blackout) and on a blackout.
export function BingoPrompt({ kind, loggedIn, onNewCard, onBlackout, onClose }: Props) {
  const saved = loggedIn ? "It's saved to your bingos." : "Log in to keep a record of your bingos.";
  return (
    <Modal open={kind !== null} onClose={onClose}>
      <h2 className="text-2xl font-semibold">{kind === "blackout" ? "Blackout!" : "Bingo!"}</h2>
      <p className="mt-2 text-sm text-ink-dim">{saved}</p>
      <div className="mt-5 flex flex-col gap-2">
        <button type="button" onClick={onNewCard} className={primaryButton} data-autofocus>
          Start a new card
        </button>
        {kind === "bingo" ? (
          <button type="button" onClick={onBlackout} className={secondaryButton}>
            Go for blackout
          </button>
        ) : (
          <button type="button" onClick={onClose} className={secondaryButton}>
            Keep this card
          </button>
        )}
      </div>
    </Modal>
  );
}
