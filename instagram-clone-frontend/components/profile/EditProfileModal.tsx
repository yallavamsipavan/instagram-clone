"use client";

import { userApi } from "@/lib/api/user";
import { UserProfile } from "@/types";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X } from "lucide-react";

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSaved: (updated: UserProfile) => void;
}

export default function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

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