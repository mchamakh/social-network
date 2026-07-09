"use client";
import Sidebar from "@/components/Sidebar";
import ImageUploadButton from "@/components/ImageUploadButton";
import { FiUser, FiLock, FiEye, FiTrash2, FiCamera, FiImage } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile, resolveImageUrl } from "@/lib/api";

export default function Settings() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setNickname(user.nickname ?? "");
    setBirthday(user.birthday?.slice(0, 10) ?? "");
    setAboutMe(user.about_me ?? "");
    setIsPrivate(user.is_private);
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        nickname: nickname || undefined,
        birthday: birthday || undefined,
        about_me: aboutMe || undefined,
      });
      setUser({ ...updated, is_private: updated.is_private } as typeof user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleAvatarUploaded = async (url: string) => {
    try {
      const updated = await updateProfile({ avatar: url });
      setUser({ ...updated } as typeof user);
    } catch {}
  };

  const handleBannerUploaded = async (url: string) => {
    try {
      const updated = await updateProfile({ banner: url });
      setUser({ ...updated } as typeof user);
    } catch {}
  };

  const handleTogglePrivate = async () => {
    const next = !isPrivate;
    setIsPrivate(next);
    try {
      const updated = await updateProfile({ is_private: next });
      setUser({ ...updated } as typeof user);
    } catch {
      setIsPrivate(!next);
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) return;
    // TODO: call PUT /api/users/me/password
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    // TODO: call DELETE /api/users/me with confirmation
  };

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-8 pt-8 pb-8">
        <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="logo" className="h-12 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-black">Settings</h1>

          {/* Avatar */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-black flex items-center gap-2">
              <FiCamera size={16} />
              Profile picture
            </p>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={resolveImageUrl(user.avatar)} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <FiUser size={26} className="text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <ImageUploadButton
                  onUploaded={handleAvatarUploaded}
                  className="cursor-pointer bg-black text-white text-xs px-4 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors w-fit disabled:opacity-40"
                >
                  Upload photo
                </ImageUploadButton>
                <p className="text-xs text-gray-400">JPEG, PNG or GIF, max 10MB.</p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-black flex items-center gap-2">
              <FiImage size={16} />
              Banner
            </p>
            <div className="flex flex-col gap-3">
              <div className="w-full h-28 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center">
                {user.banner ? (
                  <img src={resolveImageUrl(user.banner)} alt="banner" className="w-full h-full object-cover" />
                ) : (
                  <FiImage size={22} className="text-gray-400" />
                )}
              </div>
              <ImageUploadButton
                onUploaded={handleBannerUploaded}
                className="cursor-pointer bg-black text-white text-xs px-4 py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors w-fit disabled:opacity-40"
              >
                Upload banner
              </ImageUploadButton>
            </div>
          </div>

          {/* Profile info */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-black flex items-center gap-2">
              <FiUser size={16} />
              Profile information
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="@handle"
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Birthday</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">About me</label>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Tell us a little about yourself..."
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400 resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{aboutMe.length}/200</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              {saved && <p className="text-xs text-green-600">Saved!</p>}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-black flex items-center gap-2">
              <FiEye size={16} />
              Privacy
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black font-medium">Private account</p>
                <p className="text-xs text-gray-400 mt-0.5">Only your followers can see your posts.</p>
              </div>
              <button
                onClick={handleTogglePrivate}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  isPrivate ? "bg-black" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                    isPrivate ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-black flex items-center gap-2">
              <FiLock size={16} />
              Change password
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update password
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 border border-red-100">
            <p className="text-sm font-semibold text-red-500 flex items-center gap-2">
              <FiTrash2 size={16} />
              Danger zone
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black font-medium">Delete account</p>
                <p className="text-xs text-gray-400 mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="text-xs bg-red-50 text-red-500 px-4 py-2 rounded-full font-medium hover:bg-red-100 transition-colors shrink-0"
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
