"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FollowResponse } from '@/types';
import { followApi } from '@/lib/api/follow';
import Button from '@/components/ui/Button';

export default function FollowRequestsPage() {
  const [requests, setRequests] = useState<FollowResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    followApi
      .getPendingRequests()
      .then((res) => setRequests(res.content))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAccept = async (userId: number) => {
    setProcessingId(userId);
    try {
      await followApi.accept(userId);
      setRequests((prev) => prev.filter((r) => r.userId !== userId));
    } catch {
      // ignore for now
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: number) => {
    setProcessingId(userId);
    try {
      await followApi.reject(userId);
      setRequests((prev) => prev.filter((r) => r.userId !== userId));
    } catch {
      // ignore for now
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-100 mb-5">Follow Requests</h1>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm py-10">No pending follow requests</p>
      ) : (
        <div className="space-y-1">
          {requests.map((request) => (
            <div
              key={request.userId}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition-colors animate-fade-in-up"
            >
              <Link href={`/profile/${request.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {request.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={request.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-semibold text-zinc-300">
                        {request.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-zinc-100 truncate">{request.username}</p>
              </Link>

              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={() => handleAccept(request.userId)}
                  isLoading={processingId === request.userId}
                  className="!px-4 !py-1.5 !text-xs"
                >
                  Accept
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleReject(request.userId)}
                  disabled={processingId === request.userId}
                  className="!px-4 !py-1.5 !text-xs"
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}