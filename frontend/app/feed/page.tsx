"use client";
import Sidebar from "@/components/Sidebar";
import { FiUser, FiMessageCircle, FiHeart, FiImage, FiSend } from "react-icons/fi";
import { useState } from "react";

type Post = {
  id: string;
  author: string;
  handle: string;
  date: string;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  liked: boolean;
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    // TODO: call POST /api/posts
    setNewPost("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="relative sticky top-0 h-screen">
        <img src="/logo.png" alt="logo" className="absolute top-6 left-15 h-14 w-auto z-10" />
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-3 pt-0">
        {/* Composer */}
        <div className="sticky top-0 z-10 bg-gray-100 pt-6 pb-4 px-8">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <FiUser size={20} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePost()}
                  placeholder="Quelle est ta pensée du jour ?"
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
                  disabled={!newPost.trim()}
                  className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiSend size={14} />
                  Publier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="px-8 pb-8">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
                Aucune publication pour l'instant.
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <FiUser size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">{post.author}</p>
                      <p className="text-xs text-gray-400">
                        {post.handle} · {post.date}
                      </p>
                    </div>
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
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.liked ? "text-red-500" : "hover:text-red-400"
                      }`}
                    >
                      <FiHeart size={17} fill={post.liked ? "currentColor" : "none"} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                      <FiMessageCircle size={17} />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
