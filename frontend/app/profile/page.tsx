"use client";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import FollowListModal, { type FollowListUser } from "@/components/FollowListModal";
import ImageUploadButton from "@/components/ImageUploadButton";
import {
  FiUser,
  FiMessageCircle,
  FiHeart,
  FiEdit,
  FiSend,
  FiImage,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserPosts,
  createPost,
  toggleLike,
  getComments,
  addComment,
  deletePost,
  getFollowers,
  getFollowing,
  type PostResponse,
  type CommentResponse,
  resolveImageUrl,
} from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "almost_private" | "private">("public");
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentResponse[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [commentImage, setCommentImage] = useState<Record<string, string | null>>({});
  const [followers, setFollowers] = useState<FollowListUser[]>([]);
  const [following, setFollowing] = useState<FollowListUser[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [modal, setModal] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserPosts(user.id);
      setPosts(data ?? []);
    } catch {}
  }, [user]);

  const fetchFollowLists = useCallback(async () => {
    if (!user) return;
    try {
      const [followersData, followingData] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id),
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchPosts();
    fetchFollowLists();
  }, [fetchPosts, fetchFollowLists]);

  const toggleAllowedUser = (id: string) => {
    setAllowedUsers((prev) => (prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]));
  };

  const handlePost = async () => {
    if (!newPost.trim() && !newPostImage) return;
    if (privacy === "private" && allowedUsers.length === 0) return;
    setPosting(true);
    try {
      await createPost({
        content: newPost.trim(),
        privacy,
        image: newPostImage ?? undefined,
        allowed_users: privacy === "private" ? allowedUsers : undefined,
      });
      setNewPost("");
      setNewPostImage(null);
      setAllowedUsers([]);
      await fetchPosts();
    } catch {} finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );
    try { await toggleLike(postId); } catch { await fetchPosts(); }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {}
  };

  const toggleComments = async (postId: string) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    if (!comments[postId]) {
      try {
        const data = await getComments(postId);
        setComments((prev) => ({ ...prev, [postId]: data ?? [] }));
      } catch {}
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentInput[postId]?.trim();
    const image = commentImage[postId] ?? undefined;
    if (!text && !image) return;
    try {
      await addComment(postId, text ?? "", image);
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      setCommentImage((prev) => ({ ...prev, [postId]: null }));
      const data = await getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: data ?? [] }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
    } catch {}
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading || !user) return null;

  const displayName = `${user.first_name} ${user.last_name}`;
  const handle = user.nickname ?? user.email;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-3 pt-0">
        {/* Banner + info */}
        <div className="shrink-0">
          <div className="w-full h-48 bg-gray-300 rounded-b-2xl overflow-hidden">
            {user.banner && (
              <img src={resolveImageUrl(user.banner)} alt="" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex flex-col px-8">
            <div className="flex items-end justify-between -mt-12">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img src={resolveImageUrl(user.avatar)} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <FiUser size={40} className="text-gray-500" />
                  )}
                </div>
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-black">{displayName}</h1>
                  <p className="text-gray-400 text-sm">@{handle}</p>
                </div>
              </div>

              <Link
                href="/settings"
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-black hover:text-white transition-colors mb-1"
              >
                <FiEdit size={14} />
                Edit profile
              </Link>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {user.about_me && <p className="text-sm text-black">{user.about_me}</p>}
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{user.email}</span>
                {user.birthday && <span>Born {user.birthday}</span>}
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <button onClick={() => setModal("followers")} className="text-black font-semibold hover:underline">
                  {followers.length} <span className="text-gray-400 font-normal">followers</span>
                </button>
                <button onClick={() => setModal("following")} className="text-black font-semibold hover:underline">
                  {following.length} <span className="text-gray-400 font-normal">following</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="sticky top-0 z-10 bg-gray-100 py-4 px-8">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                  {user.avatar ? (
                    <img src={resolveImageUrl(user.avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                  ) : (
                    <FiUser size={20} className="text-gray-500" />
                  )}
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
              {newPostImage && (
                <div className="relative w-fit">
                  <img src={resolveImageUrl(newPostImage)} alt="" className="max-h-40 rounded-xl object-contain bg-gray-100" />
                  <button
                    onClick={() => setNewPostImage(null)}
                    className="absolute top-1 right-1 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              )}
              {privacy === "private" && (
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                  <p className="text-xs font-medium text-gray-500">Choose who can see this post:</p>
                  {followers.length === 0 ? (
                    <p className="text-xs text-gray-400">You don&apos;t have any followers yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                      {followers.map((f) => (
                        <label key={f.id} className="flex items-center gap-2 text-xs text-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowedUsers.includes(f.id)}
                            onChange={() => toggleAllowedUser(f.id)}
                          />
                          {f.first_name} {f.last_name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between px-2">
                <ImageUploadButton
                  onUploaded={(url) => setNewPostImage(url)}
                  className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-sm"
                >
                  <FiImage size={18} />
                  <span>Photo</span>
                </ImageUploadButton>
                <div className="flex items-center gap-2">
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
                    className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1.5 outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="almost_private">Followers</option>
                    <option value="private">Custom</option>
                  </select>
                  <button
                    onClick={handlePost}
                    disabled={(!newPost.trim() && !newPostImage) || posting || (privacy === "private" && allowedUsers.length === 0)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiSend size={14} />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="px-8 pb-8">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
                No posts yet.
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      {user.avatar ? (
                        <img src={resolveImageUrl(user.avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                      ) : (
                        <FiUser size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black">{displayName}</p>
                      <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>

                  <p className="text-sm text-black">{post.content}</p>

                  {post.image && (
                    <img src={resolveImageUrl(post.image)} alt="" className="w-full rounded-xl object-contain bg-gray-100 max-h-[28rem]" />
                  )}

                  <div className="flex items-center gap-5 text-gray-400 text-sm mt-1">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${post.liked ? "text-red-500" : "hover:text-red-400"}`}
                    >
                      <FiHeart size={17} fill={post.liked ? "currentColor" : "none"} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 hover:text-black transition-colors"
                    >
                      <FiMessageCircle size={17} />
                      <span>{post.comments_count}</span>
                      {openComments === post.id ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                    </button>
                  </div>

                  {openComments === post.id && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                      {(comments[post.id] ?? []).map((c) => (
                        <div key={c.id} className="flex items-start gap-2">
                          <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                            <FiUser size={13} className="text-gray-400" />
                          </div>
                          <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                            <p className="text-xs font-semibold text-black">{c.author_name}</p>
                            {c.image && (
                              <img src={resolveImageUrl(c.image)} alt="" className="max-h-40 rounded-lg object-contain bg-gray-100 mt-1 mb-1" />
                            )}
                            {c.content && <p className="text-xs text-gray-600">{c.content}</p>}
                          </div>
                        </div>
                      ))}
                      {commentImage[post.id] && (
                        <div className="relative w-fit ml-9">
                          <img src={resolveImageUrl(commentImage[post.id])} alt="" className="max-h-24 rounded-lg object-contain bg-gray-100" />
                          <button
                            onClick={() => setCommentImage((prev) => ({ ...prev, [post.id]: null }))}
                            className="absolute top-0.5 right-0.5 h-4 w-4 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                          >
                            <FiX size={9} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <ImageUploadButton
                          onUploaded={(url) => setCommentImage((prev) => ({ ...prev, [post.id]: url }))}
                          className="text-gray-400 hover:text-black transition-colors shrink-0"
                        >
                          <FiImage size={16} />
                        </ImageUploadButton>
                        <input
                          value={commentInput[post.id] ?? ""}
                          onChange={(e) =>
                            setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                          onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                          placeholder="Write a comment…"
                          className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-black outline-none placeholder-gray-400"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!commentInput[post.id]?.trim() && !commentImage[post.id]}
                          className="h-7 w-7 bg-black rounded-full flex items-center justify-center text-white disabled:opacity-40"
                        >
                          <FiSend size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modal && (
        <FollowListModal
          title={modal === "followers" ? "Followers" : "Following"}
          users={modal === "followers" ? followers : following}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
