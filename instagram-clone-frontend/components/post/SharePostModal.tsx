"use client";

import { useEffect, useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { FollowResponse } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';
import { followApi } from '@/lib/api/follow';
import { messagesApi } from '@/lib/api/messages';
import { useToastStore } from '@/lib/store/toastStore';

interface SharePostModalProps {
  postId: number;
  onClose: () => void;
}

export default function SharePostModal({ postId, onClose }: SharePostModalProps) {
  const currentUser = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);
  const [following, setFollowing] = useState<FollowResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<number | null>(null);
  const [sentTo, setSentTo] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!currentUser) return;
    followApi
      .getFollowing(currentUser.id, 0, 100)
      .then((res) => setFollowing(res.content))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const handleSend = async (userId: number) => {
    setSendingTo(userId);
    try {
      await messagesApi.sendMessage(userId, { sharedPostId: postId });
      setSentTo((prev) => new Set(prev).add(userId));
      showToast('Post shared!', 'success');
    } catch {
      showToast('Failed to share post. Please try again.', 'error');
    } finally {
      setSendingTo(null);
    }
  };

  const filtered = following.filter((f) =>
    f.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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
          <h2 className="font-semibold text-zinc-100">Share Post</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-3 border-b border-zinc-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people you follow..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-800/60 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-8">
              {following.length === 0 ? 'Follow people to share posts with them' : 'No matches found'}
            </p>
          ) : (
            filtered.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-zinc-300">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-zinc-100 flex-1">{user.username}</span>

                {sentTo.has(user.userId) ? (
                  <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                    <Check size={14} /> Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleSend(user.userId)}
                    disabled={sendingTo === user.userId}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sendingTo === user.userId ? '...' : 'Send'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}