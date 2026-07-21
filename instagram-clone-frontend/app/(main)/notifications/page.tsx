"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { Notification } from '@/types';
import { notificationsApi } from '@/lib/api/notifications';
import { subscribeToDestination, unsubscribeFromDestination } from '@/lib/websocket/socketClient';

const iconMap = {
  FOLLOW_REQUEST: UserPlus,
  FOLLOW_ACCEPTED: UserCheck,
  LIKE_POST: Heart,
  LIKE_COMMENT: Heart,
  COMMENT: MessageCircle
};

const messageMap = {
  FOLLOW_REQUEST: 'requested to follow you',
  FOLLOW_ACCEPTED: 'started following you',
  LIKE_POST: 'liked your post',
  LIKE_COMMENT: 'liked your comment',
  COMMENT: 'commented on your post'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetching this list is what triggers the backend to mark unread items as read
    // (with a fresh readAt timestamp) and clean up anything read 48+ hours ago.
    // This response still reflects the pre-open unread state, so today's new
    // notifications appear highlighted one last time on this load.
    notificationsApi
      .getNotifications()
      .then((res) => setNotifications(res.content))
      .finally(() => setIsLoading(false));

    const handleNewNotification = (payload: unknown) => {
      const notification = payload as Notification;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    const handleDeleteNotification = (payload: unknown) => {
      const notificationId = payload as number;
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    subscribeToDestination('/user/queue/notifications', handleNewNotification);
    subscribeToDestination('/user/queue/notifications/deleted', handleDeleteNotification);

    return () => {
      unsubscribeFromDestination('/user/queue/notifications', handleNewNotification);
      unsubscribeFromDestination('/user/queue/notifications/deleted', handleDeleteNotification);
    };
  }, []);

  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-100 mb-5">Notifications</h1>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-center text-zinc-500 text-sm py-10">No notifications yet</p>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type];
            const isUnread = !notification.isRead;

            return (
              <Link
                key={notification.id}
                href={`/profile/${notification.actorUsername}`}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors animate-fade-in-up ${isUnread
                  ? 'bg-pink-500/[0.07] hover:bg-pink-500/[0.12] border border-pink-500/20'
                  : 'hover:bg-zinc-900 border border-transparent'
                  }`}
              >
                {isUnread && (
                  <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-gradient-to-b from-purple-400 via-pink-400 to-orange-300 rounded-full" />
                )}

                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px]">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                      {notification.actorAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={notification.actorAvatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-zinc-300">
                          {notification.actorUsername.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-zinc-950 rounded-full p-1">
                    <Icon
                      size={13}
                      className={
                        notification.type.startsWith('LIKE') ? 'fill-pink-500 text-pink-500' : 'text-blue-400'
                      }
                    />
                  </div>
                </div>

                <p className={`text-sm flex-1 ${isUnread ? 'text-zinc-100 font-medium' : 'text-zinc-400'}`}>
                  <span className="font-semibold">{notification.actorUsername}</span>{' '}
                  {messageMap[notification.type]}
                </p>

                <span className={`text-xs shrink-0 ${isUnread ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {timeAgo(notification.createdAt)}
                </span>

                {isUnread && <div className="w-2 h-2 bg-pink-500 rounded-full shrink-0 animate-pulse" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
