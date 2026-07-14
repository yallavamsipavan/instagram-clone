"use client";

import { Post } from "@/types";
import { Heart, MessageCircle, Play } from "lucide-react";
import { useState } from "react";
import PostModal from "./PostModal";

interface PostGridProps {
  posts: Post[];
}

export default function PostGrid({ posts }: PostGridProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400 text-lg font-medium mb-1">No posts yet</p>
        <p className="text-zinc-600 text-sm">Posts will appear here once shared</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="relative aspect-square bg-zinc-900 overflow-hidden group"
          >
            {post.mediaType === 'IMAGE' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.mediaUrl}
                alt={post.caption || 'Post'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <>
                <video src={post.mediaUrl} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <Play size={16} className="text-white fill-white" />
                </div>
              </>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <Heart size={18} className="fill-white" />
                {post.likesCount}
              </div>
              <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <MessageCircle size={18} className="fill-white" />
                {post.commentsCount}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}