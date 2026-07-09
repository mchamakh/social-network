"use client";
import { resolveImageUrl } from "@/lib/api";
import { FiUser, FiX } from "react-icons/fi";
import Link from "next/link";

export type FollowListUser = {
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  avatar?: string;
};

export default function FollowListModal({
  title,
  users,
  onClose,
}: {
  title: string;
  users: FollowListUser[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold text-black">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Nobody here yet.</p>
          ) : (
            users.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  {u.avatar ? (
                    <img src={resolveImageUrl(u.avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                  ) : (
                    <FiUser size={16} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{u.first_name} {u.last_name}</p>
                  {u.nickname && <p className="text-xs text-gray-400">@{u.nickname}</p>}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
