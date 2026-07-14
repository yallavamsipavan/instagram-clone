"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { Message } from '@/types';
import { messagesApi } from '@/lib/api/messages';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onUpdated: (updated: Message) => void;
  onDeleted: (messageId: number) => void;
}

export default function MessageBubble({ message, isOwnMessage, onUpdated, onDeleted }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEdit = async () => {
    if (!editContent.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const updated = await messagesApi.editMessage(message.id, editContent.trim());
      onUpdated(updated);
      setIsEditing(false);
    } catch {
      // ignore for now
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsend = async () => {
    if (!confirm('Unsend this message?')) return;
    try {
      await messagesApi.unsendMessage(message.id);
      onDeleted(message.id);
    } catch {
      // ignore for now
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 text-sm italic">
          Message deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div className={`flex items-center gap-1.5 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm ${isOwnMessage
            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white'
            : 'bg-zinc-800 text-zinc-100'
            }`}
        >
          {message.messageType === 'POST_SHARE' && message.sharedPostMediaUrl && (
            <Link href={`/`} className="block mb-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.sharedPostMediaUrl}
                alt="Shared post"
                className="rounded-lg max-w-full max-h-48 object-cover"
              />
            </Link>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-black/20 text-white text-sm rounded px-2 py-1 focus:outline-none min-w-[120px]"
                autoFocus
              />
              <button onClick={handleSaveEdit} disabled={isSaving} className="text-white">
                <Check size={16} />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-white">
                <X size={16} />
              </button>
            </div>
          ) : (
            message.content && <p>{message.content}</p>
          )}

          {message.editedAt && !isEditing && (
            <span className="text-[10px] opacity-70 block mt-0.5">edited</span>
          )}
        </div>

        {isOwnMessage && !isEditing && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-500 hover:text-zinc-300">
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-10 w-32">
                {message.messageType === 'TEXT' && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    handleUnsend();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-zinc-700 transition-colors"
                >
                  <Trash2 size={12} /> Unsend
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}