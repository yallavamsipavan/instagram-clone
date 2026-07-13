"use client";

import Button from "@/components/ui/Button";
import { postsApi } from "@/lib/api/posts";
import { ApiErrorResponse } from "@/types";
import { AxiosError } from "axios";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setError('');

    const isImage = selected.type.startsWith('image/');
    const isVideo = selected.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please select an image or video file.');
      return;
    }

    setFile(selected);
    setMediaType(isImage ? 'IMAGE' : 'VIDEO');
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a photo or video to share');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const post = await postsApi.createPost(file, caption);
      router.push(`/profile/${post.username}`);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data?.message || 'Failed to create post. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-100 mb-6">Create new post</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-fade-in-up">
        {!previewUrl ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-96 flex flex-col items-center justify-center gap-4 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors duration-200"
          >
            <ImagePlus size={56} strokeWidth={1.5} />
            <div className="text-center">
              <p className="font-medium text-zinc-300">Select photo or video to share</p>
              <p className="text-xs text-zinc-600 mt-1">JPG, PNG, MP4 supported</p>
            </div>
          </button>
        ) : (
          <div className="relative bg-black">
            <button
              onClick={handleRemoveFile}
              className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
            >
              <X size={18} />
            </button>
            {mediaType === 'IMAGE' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="w-full max-h-[450px] object-contain mx-auto" />
            ) : (
              <video src={previewUrl} controls className="w-full max-h-[450px] mx-auto" />
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {previewUrl && (
          <div className="p-4 space-y-3">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              maxLength={2200}
              className="w-full bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-500 text-sm rounded-lg px-4 py-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none transition-all"
            />
            <p className="text-xs text-zinc-600 text-right">{caption.length}/2200</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3 mt-4">
          {error}
        </p>
      )}

      {previewUrl && (
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={handleRemoveFile} className="flex-1" disabled={isSubmitting}>
            Discard
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Sharing...
              </span>
            ) : (
              'Share'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}