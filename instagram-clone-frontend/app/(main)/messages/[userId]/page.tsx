"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { Message, UserProfile } from '@/types';
import { messagesApi } from '@/lib/api/messages';
import { userApi } from '@/lib/api/user';
import { useAuthStore } from '@/lib/store/authStore';
import { subscribeToDestination, unsubscribeFromDestination } from '@/lib/websocket/socketClient';
import MessageBubble from '@/components/messages/MessageBubble';

export default function ChatPage() {
  const params = useParams<{ userId: string }>();
  const otherUserId = Number(params.userId);

  const currentUserId = useAuthStore((state) => state.user?.id);

  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadConversation = async () => {
      setIsLoading(true);
      try {
        const conversation = await messagesApi.getConversation(otherUserId);
        // reverse since backend returns newest-first, chat UI wants oldest-first
        setMessages([...conversation.content].reverse());
      } catch {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleIncomingMessage = useCallback((payload: unknown) => {
    const message = payload as Message;
    // only add to this chat window if it's part of this conversation
    if (message.senderId === otherUserId || message.receiverId === otherUserId) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }
  }, [otherUserId]);

  const handleEditedMessage = useCallback((payload: unknown) => {
    const message = payload as Message;
    setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)));
  }, []);

  const handleDeletedMessage = useCallback((payload: unknown) => {
    const messageId = payload as number;
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, content: null } : m)));
  }, []);

  useEffect(() => {
    subscribeToDestination('/user/queue/messages', handleIncomingMessage);
    subscribeToDestination('/user/queue/messages/edited', handleEditedMessage);
    subscribeToDestination('/user/queue/messages/deleted', handleDeletedMessage);

    return () => {
      unsubscribeFromDestination('/user/queue/messages', handleIncomingMessage);
      unsubscribeFromDestination('/user/queue/messages/edited', handleEditedMessage);
      unsubscribeFromDestination('/user/queue/messages/deleted', handleDeletedMessage);
    };
  }, [handleIncomingMessage, handleEditedMessage, handleDeletedMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      const otherUsername = messages[0].senderId === otherUserId ? messages[0].senderUsername : messages[0].receiverUsername;
      userApi.getProfile(otherUsername).then(setOtherUser).catch(() => { });
    }
  }, [messages, otherUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const sent = await messagesApi.sendMessage(otherUserId, { content });
      setMessages((prev) => [...prev, sent]);
    } catch {
      setNewMessage(content); // restore on failure
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-lg sticky top-0 z-10">
        <Link href="/messages" className="text-zinc-400 hover:text-white transition-colors md:hidden">
          <ArrowLeft size={20} />
        </Link>
        {otherUser && (
          <Link href={`/profile/${otherUser.username}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px]">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                {otherUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-zinc-300">
                    {otherUser.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm font-semibold text-zinc-100">{otherUser.username}</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-10">
            No messages yet. Say hello 👋
          </p>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
                onUpdated={(updated) =>
                  setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
                }
                onDeleted={(id) =>
                  setMessages((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, isDeleted: true, content: null } : m))
                  )
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="text-pink-400 disabled:text-zinc-700 transition-colors p-2"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};