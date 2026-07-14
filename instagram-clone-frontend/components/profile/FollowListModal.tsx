"use client";

import { followApi } from "@/lib/api/follow";
import { FollowResponse } from "@/types";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FollowListModalProps {
  userId: number;
  type: 'followers' | 'following';
  onClose: () => void;
}

export default function FollowListModal({ userId, type, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<FollowResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchList = (type === 'followers') ? followApi.getFollowers : followApi.getFollowing;
    fetchList(userId)
      .then((res) => setUsers(res.content))
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load this list.');
      })
      .finally(() => setIsLoading(false));
  }, [userId, type]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-100 capitalize">{type}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-zinc-500 text-sm py-8">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-8">No {type} yet</p>
          ) : (
            users.map((user) => (
              <Link
                key={user.userId}
                href={`/profile/${user.username}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-zinc-300">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-zinc-100">{user.username}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}