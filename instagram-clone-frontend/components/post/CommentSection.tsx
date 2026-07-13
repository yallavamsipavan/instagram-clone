"use client";

import { commentsApi } from "@/lib/api/comments";
import { likesApi } from "@/lib/api/likes";
import { Comment } from "@/types";
import { Heart, Send } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface CommentSectionProps {
  postId: number;
  onCommentAdded?: () => void;
}

export default function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // silently fail for now, could add a toast later
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number, currentlyLiked: boolean) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likedByCurrentUser: !currentlyLiked, likesCount: c.likesCount + (currentlyLiked ? -1 : 1) }
          : c
      )
    );

    try {
      if (currentlyLiked) {
        await likesApi.unlikeComment(commentId);
      } else {
        await likesApi.likeComment(commentId);
      }
    } catch {
      // revert on failure
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likedByCurrentUser: currentlyLiked, likesCount: c.likesCount + (currentlyLiked ? 1 : -1) }
            : c
        )
      );
    }
  };

  return (
    <div className="border-t border-zinc-800 px-4 py-3">
      {isLoading ? (
        <p className="text-xs text-zinc-600">Loading comments...</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto mb-3">
          {comments.length === 0 && (
            <p className="text-xs text-zinc-600">No comments yet. Be the first!</p>
          )}
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-2 text-sm">
              <div>
                <Link href={`/profile/${comment.username}`} className="font-semibold text-zinc-200 hover:underline mr-2">
                  {comment.username}
                </Link>
                <span className="text-zinc-300">{comment.content}</span>
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