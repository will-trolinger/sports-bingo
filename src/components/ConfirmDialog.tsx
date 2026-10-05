import { Modal, primaryButton } from "./Modal";

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-ink-dim">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-11 rounded-md px-4 text-sm text-ink-dim hover:text-ink">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={primaryButton}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
