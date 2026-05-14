"use client";
import Sidebar from "@/components/Sidebar";
<<<<<<< HEAD
import {
  FiUser,
  FiMessageCircle,
  FiHeart,
  FiEdit,
  FiSend,
  FiImage,
} from "react-icons/fi";
import { useState } from "react";

type Post = {
  id: string;
  date: string;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  liked: boolean;
};
=======
import { FiUser, FiMessageCircle, FiEdit } from "react-icons/fi";
>>>>>>> c88622a (add & create pfp, banner, all profile info, posts, edit profile button)

export default function Profile() {
  // TODO: fetch current user from GET /api/users/me
  const user = {
    first_name: "",
    last_name: "",
    nickname: "",
    birthday: "",
    about_me: "",
    avatar: null,
    followers: 0,
    following: 0,
    joined: "",
  };

  // TODO: fetch from GET /api/users/me/posts
  const [posts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (!newPost.trim()) return;
    // TODO: call POST /api/posts
    setNewPost("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
<<<<<<< HEAD
      <div className="sticky top-0 h-screen">
=======
      <div className="relative sticky top-0 h-screen">
        <img
          src="/logo.png"
          alt="logo"
          className="absolute top-6 left-15 h-14 w-auto z-10"
        />
>>>>>>> c88622a (add & create pfp, banner, all profile info, posts, edit profile button)
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-3 pt-0">
<<<<<<< HEAD
        {/* Banner + info */}
        <div className="shrink-0">
=======
        {/* BANNIERE + INFOS */}
        <div className="flex-shrink-0">
>>>>>>> c88622a (add & create pfp, banner, all profile info, posts, edit profile button)
          <div className="w-full h-48 bg-gray-300 rounded-b-2xl" />

          <div className="flex flex-col px-8">
            <div className="flex items-end justify-between -mt-12">
              <div className="flex items-end gap-4">
<<<<<<< HEAD
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FiUser size={40} className="text-gray-500" />
                  )}
                </div>
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-black">
                    {user.first_name || user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : "Your Name"}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {user.nickname ? `@${user.nickname}` : "@username"}
                  </p>
                </div>
              </div>

              <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-black hover:text-white transition-colors mb-1">
                <FiEdit size={14} />
                Edit profile
=======
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
                  <FiUser size={40} className="text-gray-500" />
                </div>
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-black">Dempele</h1>
                  <p className="text-gray-400 text-sm">@dembouz</p>
                </div>
              </div>

              <button className="flex items-center bg-gray-50 gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600  hover:bg-black hover:text-white transition-colors mb-1">
                <FiEdit size={14} />
                Modifier le profil
>>>>>>> c88622a (add & create pfp, banner, all profile info, posts, edit profile button)
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-1">
<<<<<<< HEAD
              {user.about_me && (
                <p className="text-sm text-black">{user.about_me}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-400">
                {user.birthday && <span>Born {user.birthday}</span>}
                {user.joined && <span>Joined {user.joined}</span>}
              </div>
              <div className="flex gap-4 text-sm mt-1">
                <span>
                  <strong className="text-black">{user.following}</strong>{" "}
                  <span className="text-gray-400">Following</span>
                </span>
                <span>
                  <strong className="text-black">{user.followers}</strong>{" "}
                  <span className="text-gray-400">Followers</span>
=======
              <p className="text-sm text-black">
                Parisien dans l'âme, rouge et bleu dans le sang.
              </p>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>Né le 20/02/2005</span>
                <span>A rejoint Social en juin 2020</span>
              </div>
              <div className="flex gap-4 text-sm mt-1">
                <span>
                  <strong className="text-black">106</strong>{" "}
                  <span className="text-gray-400">Abonnements</span>
                </span>
                <span>
                  <strong className="text-black">3,2k</strong>{" "}
                  <span className="text-gray-400">Abonnés</span>
>>>>>>> c88622a (add & create pfp, banner, all profile info, posts, edit profile button)
                </span>
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Composer */}
        <div className="sticky top-0 z-10 bg-gray-100 py-4 px-8">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
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
                  disabled={!newPost.trim()}
                  className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiSend size={14} />
                  Post
                </button>
              </div>
=======
        {/* CHAMP STICKY */}
        <div className="sticky top-0 z-10 bg-gray-100 py-4 px-8">
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <FiUser size={20} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Quelle est ta pensée du jour ?"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400 outline-none"
              />
>>>>>>> c88622a (add & create pfp, banner, all profile info, posts, edit profile button)
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Posts */}
        <div className="px-8 pb-8">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
                No posts yet.
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <FiUser size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-400">{post.date}</p>
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
                      className={`flex items-center gap-1.5 transition-colors ${post.liked ? "text-red-500" : "hover:text-red-400"}`}
                    >
                      <FiHeart
                        size={17}
                        fill={post.liked ? "currentColor" : "none"}
                      />
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
=======
        {/* POSTS */}
        <div className="px-8 pb-8">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <FiUser size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Dempele</p>
                  <p className="text-xs text-gray-400">12/04/2026 18h20</p>
                </div>
              </div>
              <p className="text-sm text-black">Dimanche au parc...</p>
              <div className="w-full h-48 bg-gray-200 rounded-xl" />
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <FiMessageCircle size={18} />
                <span>12 commentaires</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <FiUser size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Dempele</p>
                  <p className="text-xs text-gray-400">10/04/2026 14h00</p>
                </div>
              </div>
              <p className="text-sm text-black">Belle journée aujourd'hui !</p>
              <div className="w-full h-48 bg-gray-200 rounded-xl" />
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <FiMessageCircle size={18} />
                <span>4 commentaires</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <FiUser size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Dempele</p>
                  <p className="text-xs text-gray-400">08/04/2026 10h30</p>
                </div>
              </div>
              <p className="text-sm text-black">Bonne semaine à tous !</p>
              <div className="w-full h-48 bg-gray-200 rounded-xl" />
              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                <FiMessageCircle size={18} />
                <span>7 commentaires</span>
              </div>
            </div>
>>>>>>> c88622a (add & create pfp, banner, all profile info, posts, edit profile button)
          </div>
        </div>
      </div>
    </div>
  );
}
