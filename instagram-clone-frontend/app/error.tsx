"use client";

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="text-center max-w-sm animate-fade-in-up">
        <AlertTriangle size={56} className="mx-auto text-red-500/70 mb-4" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Something went wrong</h1>
        <p className="text-zinc-500 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}