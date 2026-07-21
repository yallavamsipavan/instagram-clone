"use client";

import { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { UserProfile } from '@/types';
import { userApi } from '@/lib/api/user';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}

export default function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for your avatar.');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingAvatar(true);
    setError('');

    try {
      const updated = await userApi.uploadAvatar(file);
      onSaved(updated);
    } catch {
      setError('Failed to upload avatar. Please try again.');
      setAvatarPreview(profile.avatarUrl);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const updated = await userApi.updateProfile({ fullName, bio });
      onSaved(updated);
      onClose();
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-zinc-100 text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-[2px] group"
          >
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-zinc-300">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              {isUploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-pink-400 font-semibold mt-2 hover:text-pink-300 transition-colors"
          >
            Change photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a bio..."
              rows={3}
              maxLength={500}
              className="w-full bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-500 text-sm rounded-lg px-4 py-2.5 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none transition-all"
            />
            <p className="text-xs text-zinc-600 text-right mt-1">{bio.length}/500</p>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button fullWidth onClick={handleSave} isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}