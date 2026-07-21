"use client";

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/lib/store/toastStore';

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: 'border-green-500/30 text-green-400',
  error: 'border-red-500/30 text-red-400',
  info: 'border-blue-500/30 text-blue-400',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 bg-zinc-900/95 backdrop-blur-xl border ${colorMap[toast.type]} rounded-xl px-4 py-3 shadow-2xl animate-fade-in-up`}
          >
            <Icon size={18} className="shrink-0" />
            <p className="text-sm text-zinc-100 flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}