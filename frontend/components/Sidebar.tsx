"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiBell, FiSettings, FiUsers, FiUser, FiHome, FiLogOut, FiMessageCircle } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket, type WsMessage } from "@/hooks/useWebSocket";
import { getUnreadCount, resolveImageUrl } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  const displayName = user
    ? user.nickname ?? `${user.first_name} ${user.last_name}`
    : "...";

  useEffect(() => {
    if (!user) return;
    getUnreadCount().then(setUnread).catch(() => {});
  }, [user]);

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === "notification") setUnread((c) => c + 1);
  }, []);

  useWebSocket(handleWsMessage);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex flex-col w-48 min-h-screen bg-white px-4 py-6 gap-8">
      <div className="flex items-center gap-3 pt-2 px-1">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          {user?.avatar ? (
            <img src={resolveImageUrl(user.avatar)} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-gray-500">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-black truncate">{displayName}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Main</p>
        <nav className="flex flex-col gap-1">
          <Link href="/feed" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors">
            <FiHome size={18} />
            <span className="text-sm font-medium">Feed</span>
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors">
            <FiUser size={18} />
            <span className="text-sm font-medium">Profile</span>
          </Link>
          <Link href="/groups" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors">
            <FiUsers size={18} />
            <span className="text-sm font-medium">Groups</span>
          </Link>
          <Link href="/messages" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors">
            <FiMessageCircle size={18} />
            <span className="text-sm font-medium">Messages</span>
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Settings</p>
        <nav className="flex flex-col gap-1">
          <Link
            href="/notifications"
            onClick={() => setUnread(0)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors"
          >
            <div className="relative">
              <FiBell size={18} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </div>
            <span className="text-sm font-medium">Notifications</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-black hover:text-white transition-colors">
            <FiSettings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </nav>
      </div>

      <div className="mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors w-full">
          <FiLogOut size={18} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
