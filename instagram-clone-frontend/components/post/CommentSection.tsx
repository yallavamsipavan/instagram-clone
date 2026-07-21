"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Send, Trash2, MessageCircleReply } from 'lucide-react';
import { Comment } from '@/types';
import { commentsApi } from '@/lib/api/comments';
import { likesApi } from '@/lib/api/likes';
import { useAuthStore } from '@/lib/store/authStore';
import { useToastStore } from '@/lib/store/toastStore';

interface CommentSectionProps {
  postId: number;
  onCommentAdded?: () => void;
  onCommentRemoved?: () => void;
}

export default function CommentSection({ postId, onCommentAdded, onCommentRemoved }: CommentSectionProps) {
  const currentUsername = useAuthStore((state) => state.username);
  const showToast = useToastStore((state) => state.showToast);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [repliesMap, setRepliesMap] = useState<Record<number, Comment[]>>({});
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    commentsApi
      .getComments(postId)
      .then((res) => setComments(res.content))
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await commentsApi.addComment(postId, { content: newComment.trim() });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      onCommentAdded?.();
    } catch {
      showToast('Failed to add comment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number, isReplyOf?: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentsApi.deleteComment(commentId);
      if (isReplyOf) {
        setRepliesMap((prev) => ({
          ...prev,
          [isReplyOf]: (prev[isReplyOf] || []).filter((c) => c.id !== commentId),
        }));
        setComments((prev) =>
          prev.map((c) => (c.id === isReplyOf ? { ...c, repliesCount: c.repliesCount - 1 } : c))
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        onCommentRemoved?.();
      }
    } catch {
      showToast('Failed to delete comment. Please try again.', 'error');
    }
  };

  const handleLikeComment = async (
    commentId: number,
    currentlyLiked: boolean,
    isReplyOf?: number
  ) => {
    const updateFn = (c: Comment) =>
      c.id === commentId
        ? { ...c, likedByCurrentUser: !currentlyLiked, likesCount: c.likesCount + (currentlyLiked ? -1 : 1) }
        : c;

    if (isReplyOf) {
      setRepliesMap((prev) => ({ ...prev, [isReplyOf]: (prev[isReplyOf] || []).map(updateFn) }));
    } else {
      setComments((prev) => prev.map(updateFn));
    }

    try {
      if (currentlyLiked) {
        await likesApi.unlikeComment(commentId);
      } else {
        await likesApi.likeComment(commentId);
      }
    } catch {
      const revertFn = (c: Comment) =>
        c.id === commentId
          ? { ...c, likedByCurrentUser: currentlyLiked, likesCount: c.likesCount + (currentlyLiked ? 1 : -1) }
          : c;
      if (isReplyOf) {
        setRepliesMap((prev) => ({ ...prev, [isReplyOf]: (prev[isReplyOf] || []).map(revertFn) }));
      } else {
        setComments((prev) => prev.map(revertFn));
      }
    }
  };

  const toggleReplies = async (commentId: number) => {
    const isOpen = openReplies.has(commentId);
    const next = new Set(openReplies);

    if (isOpen) {
      next.delete(commentId);
      setOpenReplies(next);
      return;
    }

    next.add(commentId);
    setOpenReplies(next);

    if (!repliesMap[commentId]) {
      try {
        const res = await commentsApi.getReplies(commentId);
        setRepliesMap((prev) => ({ ...prev, [commentId]: res.content }));
      } catch {
        setRepliesMap((prev) => ({ ...prev, [commentId]: [] }));
      }
    }
  };

  const handleAddReply = async (parentCommentId: number) => {
    if (!replyText.trim()) return;

    try {
      const reply = await commentsApi.addComment(postId, {
        content: replyText.trim(),
        parentCommentId,
      });
      setRepliesMap((prev) => ({
        ...prev,
        [parentCommentId]: [...(prev[parentCommentId] || []), reply],
      }));
      setComments((prev) =>
        prev.map((c) => (c.id === parentCommentId ? { ...c, repliesCount: c.repliesCount + 1 } : c))
      );
      setReplyText('');
      setReplyingTo(null);
      setOpenReplies((prev) => new Set(prev).add(parentCommentId));
    } catch {
      showToast('Failed to add comment. Please try again.', 'error');
    }
  };

  return (
    <div className="border-t border-zinc-800 px-4 py-3">
      {isLoading ? (
        <p className="text-xs text-zinc-600">Loading comments...</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto mb-3">
          {comments.length === 0 && (
            <p className="text-xs text-zinc-600">No comments yet. Be the first!</p>
          )}

          {comments.map((comment) => (
            <div key={comment.id}>
              <div className="flex items-start justify-between gap-2 text-sm">
                <div className="flex-1">
                  <Link href={`/profile/${comment.username}`} className="font-semibold text-zinc-200 hover:underline mr-2">
                    {comment.username}
                  </Link>
                  <span className="text-zinc-300">{comment.content}</span>

                  <div className="flex items-center gap-3 mt-1">
                    {comment.likesCount > 0 && (
                      <span className="text-[11px] text-zinc-600">
                        {comment.likesCount} {comment.likesCount === 1 ? 'like' : 'likes'}
                      </span>
                    )}
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors font-medium"
                    >
                      Reply
                    </button>
                    {currentUsername === comment.username && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[11px] text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleLikeComment(comment.id, comment.likedByCurrentUser)}
                  className="mt-0.5 shrink-0"
                >
                  <Heart
                    size={13}
                    className={comment.likedByCurrentUser ? 'fill-pink-500 text-pink-500' : 'text-zinc-600'}
                  />
                </button>
              </div>

              {replyingTo === comment.id && (
                <div className="flex items-center gap-2 mt-2 ml-1">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.username}...`}
                    className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="text-pink-400 disabled:text-zinc-700 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}

              {comment.repliesCount > 0 && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mt-1.5 ml-1"
                >
                  <MessageCircleReply size={11} />
                  {openReplies.has(comment.id)
                    ? 'Hide replies'
                    : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? 'reply' : 'replies'}`}
                </button>
              )}

              {openReplies.has(comment.id) && (
                <div className="ml-5 mt-2 space-y-2 border-l border-zinc-800 pl-3">
                  {(repliesMap[comment.id] || []).map((reply) => (
                    <div key={reply.id} className="flex items-start justify-between gap-2 text-xs">
                      <div>
                        <Link href={`/profile/${reply.username}`} className="font-semibold text-zinc-300 hover:underline mr-2">
                          {reply.username}
                        </Link>
                        <span className="text-zinc-400">{reply.content}</span>
                        {currentUsername === reply.username && (
                          <button
                            onClick={() => handleDeleteComment(reply.id, comment.id)}
                            className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors ml-2"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleLikeComment(reply.id, reply.likedByCurrentUser, comment.id)}
                        className="mt-0.5 shrink-0"
                      >
                        <Heart
                          size={11}
                          className={reply.likedByCurrentUser ? 'fill-pink-500 text-pink-500' : 'text-zinc-600'}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="text-pink-400 disabled:text-zinc-700 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}