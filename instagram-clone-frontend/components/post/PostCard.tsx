"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post } from '@/types';
import { likesApi } from '@/lib/api/likes';
import CommentSection from './CommentSection';


interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleLikeToggle = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const previousLiked = liked;
    const previousCount = likesCount;

    // optimistic update
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);

    try {
      if (previousLiked) await likesApi.unlikePost(post.id);
      else await likesApi.likePost(post.id);
    } catch {
      // revert on failure
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/profile/${post.username}`} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px]">
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
              {post.userAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.userAvatarUrl} alt={post.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-zinc-300">
                  {post.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-zinc-100 group-hover:text-zinc-300 transition-colors">
            {post.username}
          </span>
        </Link>
        <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      <div className="w-full bg-black">
        {post.mediaType === 'IMAGE' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.mediaUrl} alt={post.caption || 'Post'} className="w-full max-h-[600px] object-contain mx-auto" />
        ) : (
          <video src={post.mediaUrl} controls className="w-full max-h-[600px] mx-auto" />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeToggle}
            className="transition-transform duration-150 active:scale-90"
          >
            <Heart
              size={26}
              className={liked ? 'fill-pink-500 text-pink-500' : 'text-zinc-200 hover:text-zinc-400'}
            />
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="transition-transform duration-150 active:scale-90"
          >
            <MessageCircle size={26} className="text-zinc-200 hover:text-zinc-400" />
          </button>
          <button className="transition-transform duration-150 active:scale-90">
            <Send size={24} className="text-zinc-200 hover:text-zinc-400" />
          </button>
        </div>
        <button className="transition-transform duration-150 active:scale-90">
          <Bookmark size={24} className="text-zinc-200 hover:text-zinc-400" />
        </button>
      </div>

      {/* Likes count */}
      <div className="px-4 text-sm font-semibold text-zinc-100">
        {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pt-1 text-sm text-zinc-200">
          <Link href={`/profile/${post.username}`} className="font-semibold mr-2 hover:underline">
            {post.username}
          </Link>
          {post.caption}
        </div>
      )}

      {/* Comments toggle */}
      {commentsCount > 0 && !showComments && (
        <button
          onClick={() => setShowComments(true)}
          className="px-4 pt-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors block"
        >
          View all {commentsCount} comments
        </button>
      )}

      <div className="px-4 pt-1.5 pb-3 text-[11px] uppercase tracking-wide text-zinc-600">
        {timeAgo(post.createdAt)}
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
        />
      )}
    </article>
  );
}