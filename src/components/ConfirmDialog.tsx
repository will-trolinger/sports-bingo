import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// The browser's native <dialog>: it traps focus, closes on Escape and sits
// above the page without a library.
export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }: Props) {
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
      onCancel={onCancel}
      className="m-auto w-[min(400px,calc(100vw-2rem))] rounded-lg border border-rule bg-page p-5 text-ink shadow-xl"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-ink-dim">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-10 rounded-md px-4 text-sm text-ink-dim hover:text-ink">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="h-10 rounded-md bg-ink px-4 text-sm font-semibold text-page">
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
