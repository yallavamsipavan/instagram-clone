"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 text-center">
          <h2 className="text-sm font-semibold text-zinc-100 mb-1.5">{title}</h2>
          <p className="text-sm text-zinc-500">{message}</p>
        </div>
        <div className="border-t border-zinc-800">
          <button
            onClick={onConfirm}
            className={`w-full py-3 text-sm font-semibold border-b border-zinc-800 transition-colors ${isDangerous ? 'text-red-400 hover:bg-red-500/10' : 'text-pink-400 hover:bg-pink-500/10'
              }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 text-sm text-zinc-300 hover:bg-zinc-800/60 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}