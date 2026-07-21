"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  UserPlus,
  MessageCircle,
  User,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { notificationsApi } from '@/lib/api/notifications';
import { subscribeToDestination, unsubscribeFromDestination } from '@/lib/websocket/socketClient';

const navItems = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/create', label: 'Create', icon: PlusSquare },
  { href: '/notifications', label: 'Notifications', icon: Heart },
  { href: '/requests', label: 'Requests', icon: UserPlus },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const refreshCount = () => {
      notificationsApi.getUnreadCount().then(setUnreadCount).catch(() => { });
    };

    refreshCount();
    const interval = setInterval(refreshCount, 30000); // fallback poll

    // Live updates: new notification increments, deleted notification decrements
    const handleNew = () => setUnreadCount((c) => c + 1);
    const handleDeleted = () => setUnreadCount((c) => Math.max(0, c - 1));

    subscribeToDestination('/user/queue/notifications', handleNew);
    subscribeToDestination('/user/queue/notifications/deleted', handleDeleted);

    return () => {
      clearInterval(interval);
      unsubscribeFromDestination('/user/queue/notifications', handleNew);
      unsubscribeFromDestination('/user/queue/notifications/deleted', handleDeleted);
    };
  }, []);

  // Visiting the notifications page marks everything read on the backend;
  // reset the local badge immediately for a snappy feel instead of waiting on the poll.
  useEffect(() => {
    if (pathname === '/notifications') {
      setUnreadCount(0);
    }
  }, [pathname]);

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-zinc-800 bg-zinc-950 px-4 py-6 z-20">
        <Link href="/feed" className="text-2xl font-bold mb-10 px-2 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
          Instagram
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 relative group ${isActive
                  ? 'bg-zinc-800/80 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
              >
                <div className="relative">
                  <Icon size={24} strokeWidth={isActive ? 2.4 : 2} />
                  {label === 'Notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}

          <Link
            href={`/profile/${username}`}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${pathname === `/profile/${username}`
              ? 'bg-zinc-800/80 text-white'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
          >
            <User size={24} strokeWidth={pathname === `/profile/${username}` ? 2.4 : 2} />
            <span className="text-sm font-medium">Profile</span>
          </Link>
        </nav>

        <button
          onClick={() => {
            if (confirm('Log out?')) router.push('/login'), logout();
          }}
          className="flex items-center gap-4 px-3 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200"
        >
          <LogOut size={24} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 flex justify-around items-center py-3 z-20">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} className="relative">
              <Icon
                size={24}
                className={isActive ? 'text-white' : 'text-zinc-500'}
                strokeWidth={isActive ? 2.4 : 2}
              />
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
        <Link href={`/profile/${username}`}>
          <User
            size={24}
            className={pathname === `/profile/${username}` ? 'text-white' : 'text-zinc-500'}
          />
        </Link>
      </nav>
    </>
  );
}