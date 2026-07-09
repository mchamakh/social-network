"use client";
import Sidebar from "@/components/Sidebar";
import { FiBell, FiUserPlus, FiUsers, FiCalendar, FiCheck, FiX } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket, type WsMessage } from "@/hooks/useWebSocket";
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  acceptFollowRequest, rejectFollowRequest,
  acceptGroupInvitation, declineGroupInvitation,
  acceptJoinRequest, declineJoinRequest,
  type AppNotification,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ICONS: Record<string, React.ReactNode> = {
  follow_request:    <FiUserPlus size={16} className="text-blue-500" />,
  group_invitation:  <FiUsers size={16} className="text-purple-500" />,
  group_join_request:<FiUsers size={16} className="text-orange-500" />,
  group_event:       <FiCalendar size={16} className="text-green-500" />,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [handled, setHandled] = useState<Record<string, "accepted" | "declined">>({});

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const load = useCallback(async () => {
    try {
      const { data, unread_count } = await getNotifications();
      setNotifs(data);
      setUnread(unread_count);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type !== "notification") return;
    try {
      const n: AppNotification = JSON.parse(msg.payload);
      setNotifs((prev) => {
        if (prev.some((p) => p.id === n.id)) return prev;
        return [n, ...prev];
      });
      setUnread((c) => c + 1);
    } catch {}
  }, []);

  useWebSocket(handleWsMessage);

  const handleRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((c) => Math.max(0, c - 1));
    await markNotificationRead(id).catch(() => {});
  };

  const handleAcceptFollow = async (n: AppNotification) => {
    if (!n.reference_id) return;
    try {
      await acceptFollowRequest(n.reference_id);
      setHandled((prev) => ({ ...prev, [n.id]: "accepted" }));
      if (!n.read) handleRead(n.id);
    } catch {}
  };

  const handleDeclineFollow = async (n: AppNotification) => {
    if (!n.reference_id) return;
    try {
      await rejectFollowRequest(n.reference_id);
      setHandled((prev) => ({ ...prev, [n.id]: "declined" }));
      if (!n.read) handleRead(n.id);
    } catch {}
  };

  const handleAcceptGroupInvitation = async (n: AppNotification) => {
    if (!n.reference_id) return;
    try {
      await acceptGroupInvitation(n.reference_id);
      setHandled((prev) => ({ ...prev, [n.id]: "accepted" }));
      if (!n.read) handleRead(n.id);
    } catch {}
  };

  const handleDeclineGroupInvitation = async (n: AppNotification) => {
    if (!n.reference_id) return;
    try {
      await declineGroupInvitation(n.reference_id);
      setHandled((prev) => ({ ...prev, [n.id]: "declined" }));
      if (!n.read) handleRead(n.id);
    } catch {}
  };

  const handleAcceptGroupJoinRequest = async (n: AppNotification) => {
    if (!n.reference_id || !n.actor_id) return;
    try {
      await acceptJoinRequest(n.reference_id, n.actor_id);
      setHandled((prev) => ({ ...prev, [n.id]: "accepted" }));
      if (!n.read) handleRead(n.id);
    } catch {}
  };

  const handleDeclineGroupJoinRequest = async (n: AppNotification) => {
    if (!n.reference_id || !n.actor_id) return;
    try {
      await declineJoinRequest(n.reference_id, n.actor_id);
      setHandled((prev) => ({ ...prev, [n.id]: "declined" }));
      if (!n.read) handleRead(n.id);
    } catch {}
  };

  const handleReadAll = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await markAllNotificationsRead().catch(() => {});
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-8 pt-8 pb-8">
        <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <Image src="/logo.png" alt="logo" width={48} height={48} className="h-12 w-auto" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiBell size={20} className="text-black" />
              <h1 className="text-2xl font-bold text-black">Notifications</h1>
              {unread > 0 && (
                <span className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleReadAll}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
              >
                <FiCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="bg-white rounded-2xl py-16 px-8 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FiBell size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-black">All caught up</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                You&apos;ll be notified about follow requests, group invitations, join requests, and new events.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleRead(n.id)}
                  className={`flex items-start gap-4 px-4 py-3 rounded-2xl text-left transition-colors w-full cursor-pointer ${
                    n.read ? "bg-white" : "bg-white border-l-4 border-black"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {ICONS[n.type] ?? <FiBell size={16} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.read ? "text-gray-500" : "text-black font-medium"}`}>
                      {n.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>

                    {(() => {
                      const actionable: Record<string, { accept: (n: AppNotification) => void; decline: (n: AppNotification) => void; ready: boolean }> = {
                        follow_request: { accept: handleAcceptFollow, decline: handleDeclineFollow, ready: !!n.reference_id },
                        group_invitation: { accept: handleAcceptGroupInvitation, decline: handleDeclineGroupInvitation, ready: !!n.reference_id },
                        group_join_request: { accept: handleAcceptGroupJoinRequest, decline: handleDeclineGroupJoinRequest, ready: !!n.reference_id && !!n.actor_id },
                      };
                      const action = actionable[n.type];
                      if (!action || !action.ready) return null;
                      return (
                        <div className="mt-2">
                          {handled[n.id] ? (
                            <p className="text-xs text-gray-400 italic">
                              {handled[n.id] === "accepted" ? "Request accepted" : "Request declined"}
                            </p>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); action.accept(n); }}
                                className="flex items-center gap-1 bg-black text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-zinc-800 transition-colors"
                              >
                                <FiCheck size={12} />
                                Accept
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); action.decline(n); }}
                                className="flex items-center gap-1 bg-gray-100 text-black text-xs px-3 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors"
                              >
                                <FiX size={12} />
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-black shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
