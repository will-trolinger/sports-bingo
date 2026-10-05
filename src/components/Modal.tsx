import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// The browser's native <dialog>: it traps focus and sits above the page
// without a library. Near full width on a phone. It closes on Escape, on the
// close button, or on a tap outside it, so no dialog can trap a player who
// has no keyboard.
export function Modal({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Opening would focus the close button (the first one); each dialog
      // marks where it should start instead: its main choice, or the
      // username box.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The content sits in an inner box, so a click that lands on the
      // dialog element itself can only be on the backdrop around it.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(400px,calc(100vw-2rem))] rounded-xl border border-rule bg-page p-0 text-ink shadow-xl"
    >
      {open && (
        <div className="relative px-5 pt-12 pb-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-1.5 right-1.5 grid size-11 place-items-center rounded-full text-ink-dim hover:bg-square hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}

export const primaryButton = "h-11 rounded-md bg-ink px-4 text-sm font-semibold text-page disabled:opacity-60";
export const secondaryButton = "h-11 rounded-md border border-rule px-4 text-sm hover:bg-square";
