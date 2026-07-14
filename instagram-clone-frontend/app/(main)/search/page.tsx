"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, X } from 'lucide-react';
import { UserProfile } from '@/types';
import { userApi } from '@/lib/api/user';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const users = await userApi.search(searchQuery.trim());
      setResults(users);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce: wait 400ms after the user stops trying before searching
  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, performSearch]);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-100 mb-5">Search</h1>

      <div className="relative mb-6">
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users..."
          autoFocus
          className="w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
        </div>
      ) : hasSearched && results.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm py-10">No users found for &quot;{query}&quot;</p>
      ) : (
        <div className="space-y-1">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition-colors animate-fade-in-up"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px] shrink-0">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-semibold text-zinc-300">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{user.username}</p>
                {user.fullName && <p className="text-xs text-zinc-500">{user.fullName}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}