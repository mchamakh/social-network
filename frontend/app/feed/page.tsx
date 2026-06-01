"use client";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  FiUser,
  FiMessageCircle,
  FiHeart,
  FiImage,
  FiSend,
  FiBell,
  FiFeather,
  FiThumbsDown,
  FiTrash2,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { getPosts, createPost, deletePost } from "@/lib/api";

type Author = {
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  avatar?: string;
};

type Post = {
  id: string;
  author_id: string;
  author: Author;
  content: string;
  image_url?: string;
  created_at: string;
};

type Notification = {
  id: string;
  text: string;
  date: string;
  read: boolean;
};

type Conversation = {
  id: string;
  name: string;
  last_message: string;
  date: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [notifications] = useState<Notification[]>([]);
  const [conversations] = useState<Conversation[]>([]);

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    try {
      const post = await createPost({ content: newPost.trim() });
      setPosts((prev) => [post, ...prev]);
      setNewPost("");
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar username="User" />
      </div>

      {/* Center column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Logo + Composer */}
        <div className="sticky top-0 z-10 bg-gray-100 pt-6 pb-4 px-6 flex flex-col items-center gap-4">
          <img src="/logo.png" alt="logo" className="h-14 w-auto" />

          <div className="max-w-xl w-full mx-auto mt-22 bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                <FiUser size={20} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePost()}
                placeholder="What's on your mind?"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-black outline-none placeholder-gray-400"
              />
            </div>
            <div className="flex items-center justify-between px-2">
              <button className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-sm">
                <FiImage size={18} />
                <span>Photo</span>
              </button>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || posting}
                className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSend size={14} />
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="px-6 pb-8 flex flex-col gap-4">
          {loading ? (
            <div className="max-w-xl w-full mx-auto py-16 flex justify-center">
              <span className="text-sm text-gray-400">Loading posts...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="max-w-xl w-full mx-auto bg-white rounded-2xl py-16 px-8 flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-16 w-16 rounded-full bg-gray-100 animate-ping opacity-20" />
                <span className="absolute h-12 w-12 rounded-full bg-gray-100 animate-ping opacity-30 [animation-delay:300ms]" />
                <div className="relative h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center animate-bounce">
                  <FiFeather size={24} className="text-gray-400" />
                </div>
              </div>
              <p className="text-sm font-semibold text-black mt-2">
                Nothing to see yet
              </p>
              <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
                Posts from people you follow will show up here. Start by
                following someone!
              </p>
              <div className="flex gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="max-w-xl w-full mx-auto bg-white rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">
                        {post.author.first_name} {post.author.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {post.author.nickname
                          ? `@${post.author.nickname} · `
                          : ""}
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>

                <p className="text-sm text-black">{post.content}</p>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt=""
                    className="w-full rounded-xl object-cover max-h-64"
                  />
                )}

                <div className="flex items-center gap-5 text-gray-400 text-sm mt-1">
                  <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                    <FiHeart size={17} />
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <FiThumbsDown size={17} />
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                    <FiMessageCircle size={17} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-72 shrink-0 flex flex-col gap-4 pt-6 pr-6 pb-6">
        {/* Notifications card */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 min-h-52">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBell size={16} className="text-black" />
              <h2 className="text-sm font-bold text-black">Notifications</h2>
            </div>
            <Link
              href="/notifications"
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              See all
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">
              No notifications yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {notifications.slice(0, 4).map((notif) => (
                <li
                  key={notif.id}
                  className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl text-xs ${
                    notif.read
                      ? "text-gray-400"
                      : "bg-gray-50 text-black font-medium"
                  }`}
                >
                  <span>{notif.text}</span>
                  <span className="text-gray-400 font-normal">{notif.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Messages card */}
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 min-h-64">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiMessageCircle size={16} className="text-black" />
              <h2 className="text-sm font-bold text-black">Messages</h2>
            </div>
            <Link
              href="/messages"
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              See all
            </Link>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">
              No conversations yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {conversations.slice(0, 4).map((conv) => (
                <li key={conv.id}>
                  <Link
                    href="/messages"
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <FiUser size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-black truncate">
                        {conv.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {conv.last_message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {conv.date}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
