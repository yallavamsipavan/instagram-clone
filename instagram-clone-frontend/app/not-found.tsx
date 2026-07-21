import Link from 'next/link';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="text-center animate-fade-in-up">
        <Frown size={56} className="mx-auto text-zinc-700 mb-4" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">Page not found</h1>
        <p className="text-zinc-500 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/feed"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}