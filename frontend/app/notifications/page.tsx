"use client";
import Sidebar from "@/components/Sidebar";
import { FiBell, FiHeart, FiUserPlus, FiMessageCircle } from "react-icons/fi";
import { useState } from "react";
import Image from "next/image";

type NotificationType = "like" | "follow" | "comment";

type Notification = {
  id: string;
  type: NotificationType;
  text: string;
  date: string;
  read: boolean;
};

const ICONS: Record<NotificationType, React.ReactNode> = {
  like: <FiHeart size={16} className="text-red-400" />,
  follow: <FiUserPlus size={16} className="text-blue-400" />,
  comment: <FiMessageCircle size={16} className="text-green-400" />,
};

export default function Notifications() {
  // TODO: fetch from GET /api/notifications
  const [notifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar username="User" />
      </div>

      <div className="flex flex-col flex-1 px-8 pt-8 pb-8">
        <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.png"
              alt="logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />          </div>
          {/* Header */}
          <div className="flex items-center gap-3">
            <FiBell size={20} className="text-black" />
            <h1 className="text-2xl font-bold text-black">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl py-16 px-8 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FiBell size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-black">All caught up</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                You have no notifications yet. When someone likes, comments or
                follows you, it&apos;ll show up here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-4 py-3 rounded-2xl transition-colors ${notif.read ? "bg-white" : "bg-white border-l-4 border-black"
                    }`}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {ICONS[notif.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${notif.read ? "text-gray-500" : "text-black font-medium"}`}
                    >
                      {notif.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.date}</p>
                  </div>
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-black shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
