"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Settings, Lock } from 'lucide-react';
import { UserProfile, Post, FollowResponse } from '@/types';
import { userApi } from '@/lib/api/user';
import { postsApi } from '@/lib/api/posts';
import { followApi } from '@/lib/api/follow';
import { useAuthStore } from '@/lib/store/authStore';
import Button from '@/components/ui/Button';
import PostGrid from '@/components/profile/PostGrid';
import FollowListModal from '@/components/profile/FollowListModal';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const { username: currentUsername, setUser } = useAuthStore();
  const isOwnProfile = currentUsername === username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followStatus, setFollowStatus] = useState<FollowResponse['status'] | null>(null);
  const [incomingStatus, setIncomingStatus] = useState<FollowResponse['status'] | null>(null);
  const [postsAccessDenied, setPostsAccessDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);
  const [isRequestActionLoading, setIsRequestActionLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | 'edit' | 'unfollowConfirm' | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const profileData = await userApi.getProfile(username);
      setProfile(profileData);

      if (!isOwnProfile) {
        const status = await followApi.getStatus(profileData.id);
        setFollowStatus(status.status);

        const incoming = await followApi.getIncomingStatus(profileData.id);
        setIncomingStatus(incoming.status);
      }

      setPostsAccessDenied(false);
      try {
        const postsData = await postsApi.getUserPosts(username);
        setPosts(postsData.content);
      } catch {
        setPostsAccessDenied(true);
      }
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [username, isOwnProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFollowAction = async () => {
    if (!profile || isFollowActionLoading) return;

    // Unfollowing (either accepted or a pending outgoing request) needs confirmation
    if (followStatus === 'ACCEPTED' || followStatus === 'PENDING') {
      setActiveModal('unfollowConfirm');
      return;
    }

    setIsFollowActionLoading(true);
    try {
      const result = await followApi.sendRequest(profile.id);
      setFollowStatus(result.status);
      if (result.status === 'ACCEPTED') loadProfile();
    } finally {
      setIsFollowActionLoading(false);
    }
  };

  const confirmUnfollow = async () => {
    if (!profile) return;
    setIsFollowActionLoading(true);
    try {
      await followApi.unfollow(profile.id);
      setFollowStatus('NOT_FOLLOWING');
      setActiveModal(null);
      loadProfile();
    } finally {
      setIsFollowActionLoading(false);
    }
  };

  const handleAcceptIncoming = async () => {
    if (!profile || isRequestActionLoading) return;
    setIsRequestActionLoading(true);
    try {
      await followApi.accept(profile.id);
      setIncomingStatus('ACCEPTED');
    } finally {
      setIsRequestActionLoading(false);
    }
  };

  const handleDeclineIncoming = async () => {
    if (!profile || isRequestActionLoading) return;
    setIsRequestActionLoading(true);
    try {
      await followApi.reject(profile.id);
      setIncomingStatus('NOT_FOLLOWING');
    } finally {
      setIsRequestActionLoading(false);
    }
  };

  // Followers/Following lists and DMs are only accessible when :
  // the account is public, OR it's your own profile, OR you are an accepted follower
  const canViewListsAndMessage = isOwnProfile || !profile?.isPrivate || followStatus === 'ACCEPTED';

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-pink-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400 text-lg font-medium">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-8 animate-fade-in-up">
        <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-1 shrink-0">
          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-semibold text-zinc-300">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <h1 className="text-xl font-semibold text-zinc-100">{profile.username}</h1>

            {isOwnProfile ? (
              <button
                onClick={() => setActiveModal('edit')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg transition-colors"
              >
                <Settings size={14} />
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                {/* This person has sent ME a pending follow request */}
                {incomingStatus === 'PENDING' && (
                  <>
                    <Button
                      onClick={handleAcceptIncoming}
                      isLoading={isRequestActionLoading}
                      className="!px-5"
                    >
                      Accept Request
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleDeclineIncoming}
                      disabled={isRequestActionLoading}
                      className="!px-5"
                    >
                      Decline
                    </Button>
                  </>
                )}

                <Button
                  variant={followStatus === 'ACCEPTED' || followStatus === 'PENDING' ? 'secondary' : 'primary'}
                  onClick={handleFollowAction}
                  isLoading={isFollowActionLoading}
                  className="!px-6"
                >
                  {followStatus === 'ACCEPTED' ? 'Following' : followStatus === 'PENDING' ? 'Requested' : 'Follow'}
                </Button>

                {canViewListsAndMessage && (
                  <Link href={`/messages/${profile.id}`}>
                    <Button variant="secondary" className="!px-6">
                      Message
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center sm:justify-start gap-8 mb-4 text-sm">
            <span className="text-zinc-300">
              <strong className="text-zinc-100">{profile.postsCount}</strong> posts
            </span>

            {canViewListsAndMessage ? (
              <button
                onClick={() => setActiveModal('followers')}
                className="text-zinc-300 hover:text-white transition-colors"
              >
                <strong className="text-zinc-100">{profile.followersCount}</strong> followers
              </button>
            ) : (
              <span className="text-zinc-300 cursor-default">
                <strong className="text-zinc-100">{profile.followersCount}</strong> followers
              </span>
            )}

            {canViewListsAndMessage ? (
              <button
                onClick={() => setActiveModal('following')}
                className="text-zinc-300 hover:text-white transition-colors"
              >
                <strong className="text-zinc-100">{profile.followingCount}</strong> following
              </button>
            ) : (
              <span className="text-zinc-300 cursor-default">
                <strong className="text-zinc-100">{profile.followingCount}</strong> following
              </span>
            )}
          </div>

          {profile.fullName && <p className="text-sm font-semibold text-zinc-200">{profile.fullName}</p>}
          {profile.bio && <p className="text-sm text-zinc-400 mt-1 whitespace-pre-wrap">{profile.bio}</p>}
          {profile.isPrivate && (
            <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1 justify-center sm:justify-start">
              <Lock size={12} /> Private account
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-zinc-800 mb-1" />

      {/* Posts */}
      {postsAccessDenied ? (
        <div className="text-center py-20">
          <Lock size={40} className="mx-auto text-zinc-700 mb-3" strokeWidth={1.5} />
          <p className="text-zinc-300 font-medium mb-1">This account is private</p>
          <p className="text-zinc-600 text-sm">Follow this account to see their photos and videos.</p>
        </div>
      ) : (
        <PostGrid posts={posts} />
      )}

      {/* Modals */}
      {activeModal === 'followers' && (
        <FollowListModal userId={profile.id} type="followers" onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'following' && (
        <FollowListModal userId={profile.id} type="following" onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'edit' && (
        <EditProfileModal
          profile={profile}
          onClose={() => setActiveModal(null)}
          onSaved={(updated) => {
            setProfile(updated);
            setUser(updated);
          }}
        />
      )}
      {activeModal === 'unfollowConfirm' && (
        <ConfirmModal
          title={`Unfollow @${profile.username}?`}
          message="You'll need to send a new request if this account is private."
          confirmLabel="Unfollow"
          isDangerous
          onConfirm={confirmUnfollow}
          onCancel={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}