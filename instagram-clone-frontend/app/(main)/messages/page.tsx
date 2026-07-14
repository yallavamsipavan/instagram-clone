"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ConversationPreview } from '@/types';
import { messagesApi } from '@/lib/api/messages';
import { subscribeToDestination, unsubscribeFromDestination } from '@/lib/websocket/socketClient';
import { Message } from '@/types';

export default function MessagesListPage() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    messagesApi
      .getConversationsList()
      .then(setConversations)
      .finally(() => setIsLoading(false));

    // when a new message arrives anywheere, refresh the conversation list
    // so preview/ordering stay up to date without a manual reload
    const handleNewMessage = () => {
      messagesApi.getConversationsList().then(setConversations);
    };

    subscribeToDestination('/user/queue/messages', handleNewMessage);

    return () => {
      unsubscribeFromDestination('/user/queue/messages', handleNewMessage);
    };
  }, []);

  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-100 mb-5">Messages</h1>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm py-10">
          No conversations yet. Visit a profile to start chatting.
        </p>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <Link
              key={conv.otherUserId}
              href={`/messages/${conv.otherUserId}`}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition-colors animate-fade-in-up"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px] shrink-0">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {conv.otherUserAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={conv.otherUserAvatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-semibold text-zinc-300">
                      {conv.otherUsername.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100">{conv.otherUsername}</p>
                <p
                  className={`text-xs truncate ${conv.lastMessageReadByMe ? 'text-zinc-500' : 'text-zinc-200 font-medium'
                    }`}
                >
                  {conv.lastMessagePreview}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-zinc-600">{timeAgo(conv.lastMessageAt)}</span>
                {!conv.lastMessageReadByMe && <div className="w-2 h-2 bg-pink-500 rounded-full" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}