import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

// The browser's native <dialog>: it traps focus, closes on Escape and sits
// above the page without a library. Near full width on a phone.
export function Modal({ open, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(400px,calc(100vw-2rem))] rounded-xl border border-rule bg-page p-5 text-ink shadow-xl"
    >
      {open && children}
    </dialog>
  );
}

export const primaryButton = "h-11 rounded-md bg-ink px-4 text-sm font-semibold text-page disabled:opacity-60";
export const secondaryButton = "h-11 rounded-md border border-rule px-4 text-sm hover:bg-square";
