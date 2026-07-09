"use client";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { FiUsers, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  listGroups,
  createGroup,
  requestJoinGroup,
  acceptGroupInvitation,
  declineGroupInvitation,
  type GroupListItem,
} from "@/lib/api";
import { useRouter } from "next/navigation";

const BANNERS = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-rose-400 to-pink-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-emerald-400 to-teal-600",
  "bg-gradient-to-br from-violet-400 to-purple-600",
  "bg-gradient-to-br from-sky-400 to-cyan-600",
];

export default function Groups() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const fetchGroups = () => listGroups().then(setGroups).catch(() => {});
  useEffect(() => { if (user) fetchGroups(); }, [user]);

  const filtered = groups.filter(
    (g) => g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      await createGroup({ title: title.trim(), description: description.trim() || undefined });
      setTitle(""); setDescription(""); setShowCreate(false);
      fetchGroups();
    } catch {} finally { setCreating(false); }
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen"><Sidebar /></div>
      <div className="flex flex-col flex-1 px-8 pt-8 pb-8">
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="logo" className="h-12 w-auto" />
          </div>

          {groups.some((g) => g.my_status === "invited") && (
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-black">Group invitations</p>
              {groups.filter((g) => g.my_status === "invited").map((g) => (
                <div key={g.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <FiUsers size={16} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-black flex-1 truncate">{g.title}</p>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => acceptGroupInvitation(g.id).then(fetchGroups)} className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors">Accept</button>
                    <button onClick={() => declineGroupInvitation(g.id).then(fetchGroups)} className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiUsers size={20} className="text-black" />
              <h1 className="text-2xl font-bold text-black">Groups</h1>
            </div>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
              <FiPlus size={16} /> Create group
            </button>
          </div>

          <div className="relative">
            <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups..." className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-black outline-none placeholder-gray-400" />
          </div>

          {showCreate && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-black text-lg">New group</h2>
                  <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-black"><FiX size={20} /></button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-black">Title <span className="text-orange-500">*</span></label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-black">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400 resize-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button onClick={handleCreate} disabled={!title.trim() || creating} className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Create</button>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl py-14 flex flex-col items-center gap-3 text-center px-8">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center"><FiUsers size={20} className="text-gray-400" /></div>
              <p className="text-sm font-semibold text-black">No groups yet</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">Be the first to create a group!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((group, i) => (
                <div key={group.id} className="bg-white rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className={`${BANNERS[i % BANNERS.length]} h-24 flex items-center justify-center`}>
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FiUsers size={22} className="text-white" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <Link href={`/groups/${group.id}`} className="text-sm font-bold text-black hover:underline line-clamp-1">{group.title}</Link>
                      {group.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{group.description}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FiUsers size={13} /><span>{group.member_count} members</span>
                      </div>
                      {group.my_status === "accepted" ? (
                        <Link href={`/groups/${group.id}`} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors">Open</Link>
                      ) : group.my_status === "requested" ? (
                        <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full font-medium">Requested</span>
                      ) : group.my_status === "invited" ? (
                        <button onClick={() => acceptGroupInvitation(group.id).then(fetchGroups)} className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-medium hover:bg-zinc-800 transition-colors">Accept</button>
                      ) : (
                        <button onClick={() => requestJoinGroup(group.id).then(fetchGroups).catch(() => {})} className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-medium hover:bg-zinc-800 transition-colors">Join</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
