"use client";

import { Post } from "@/types";
import { X } from "lucide-react";
import PostCard from "@/components/post/PostCard";

interface PostModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <PostCard post={post} />
      </div>
    </div>
  );
}