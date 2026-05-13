"use client";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { FiUsers, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useState } from "react";

type Group = {
  id: string;
  title: string;
  description: string;
  members: number;
  is_member: boolean;
  is_requested: boolean;
};

export default function Groups() {
  // TODO: fetch from GET /api/groups
  const [groups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const filtered = groups.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!title.trim()) return;
    // TODO: call POST /api/groups
    setTitle("");
    setDescription("");
    setShowCreate(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-8 pt-8 pb-8">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiUsers size={20} className="text-black" />
              <h1 className="text-2xl font-bold text-black">Groups</h1>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <FiPlus size={16} />
              Create group
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups..."
              className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-black outline-none placeholder-gray-400 border border-transparent focus:border-gray-200"
            />
          </div>

          {/* Create modal */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-black text-lg">New group</h2>
                  <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-black transition-colors">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-black">
                      Title <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-black">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400 resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!title.trim()}
                    className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Groups list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl py-14 flex flex-col items-center gap-3 text-center px-8">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FiUsers size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-black">No groups yet</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                Be the first to create a group or check back later.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <FiUsers size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/groups/${group.id}`} className="text-sm font-semibold text-black hover:underline">
                      {group.title}
                    </Link>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{group.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{group.members} members</p>
                  </div>
                  {group.is_member ? (
                    <Link
                      href={`/groups/${group.id}`}
                      className="text-xs bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors shrink-0"
                    >
                      Open
                    </Link>
                  ) : group.is_requested ? (
                    <span className="text-xs bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full font-medium shrink-0">
                      Requested
                    </span>
                  ) : (
                    <button className="text-xs bg-black text-white px-4 py-1.5 rounded-full font-medium hover:bg-zinc-800 transition-colors shrink-0">
                      {/* TODO: call POST /api/groups/:id/request */}
                      Request to join
                    </button>
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
