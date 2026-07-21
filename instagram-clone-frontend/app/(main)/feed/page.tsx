"use client";

import { useEffect, useState, useCallback } from 'react';
import { Post } from '@/types';
import { postsApi } from '@/lib/api/posts';
import PostCard from '@/components/post/PostCard';
import { PostSkeleton } from '@/components/ui/Skeleton';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadFeed = useCallback(async (pageNum: number) => {
    try {
      const response = await postsApi.getFeed(pageNum, 10);
      setPosts((prev) => (pageNum === 0 ? response.content : [...prev, ...response.content]));
      setHasMore(!response.last);
    } catch {
      // could add error state/toast here
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(0);
  }, [loadFeed]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        hasMore &&
        !isLoadingMore &&
        !isLoading
      ) {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        loadFeed(nextPage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, isLoadingMore, isLoading, loadFeed]);

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {isLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg font-medium mb-2">Your feed is empty</p>
          <p className="text-zinc-600 text-sm">Follow people to see their posts here</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {isLoadingMore && <PostSkeleton />}
          {!hasMore && (
            <p className="text-center text-zinc-600 text-sm py-6">You&apos;re all caught up ✨</p>
          )}
        </>
      )}
    </div>
  );
}