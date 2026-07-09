"use client";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import ImageUploadButton from "@/components/ImageUploadButton";
import {
  FiUser,
  FiMessageCircle,
  FiHeart,
  FiImage,
  FiSend,
  FiBell,
  FiFeather,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getFeed,
  createPost,
  toggleLike,
  getComments,
  addComment,
  deletePost,
  getFollowers,
  type PostResponse,
  type CommentResponse,
  type AuthUserBasic,
  resolveImageUrl,
} from "@/lib/api";
import { useWebSocket, type WsMessage } from "@/hooks/useWebSocket";
import { useRouter } from "next/navigation";

const PRIVACY_LABELS = {
  public: "Public",
  almost_private: "Followers",
  private: "Custom",
};

export default function Feed() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<"public" | "almost_private" | "private">("public");
  const [posting, setPosting] = useState(false);
  const [followersList, setFollowersList] = useState<AuthUserBasic[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentResponse[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [commentImage, setCommentImage] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const fetchFeed = useCallback(async () => {
    try {
      const data = await getFeed();
      setPosts(data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) fetchFeed();
  }, [user, fetchFeed]);

  useEffect(() => {
    if (!user) return;
    getFollowers(user.id).then(setFollowersList).catch(() => {});
  }, [user]);

  const toggleAllowedUser = (id: string) => {
    setAllowedUsers((prev) => (prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]));
  };

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type !== "feed_update") return;
    fetchFeed();
  }, [fetchFeed]);

  useWebSocket(handleWsMessage);

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
      await fetchFeed();
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
    try {
      await toggleLike(postId);
    } catch {
      await fetchFeed();
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {}
  };

  const toggleComments = async (postId: string) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
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
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Center */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="sticky top-0 z-10 bg-gray-100 pt-6 pb-4 px-6 flex flex-col items-center gap-4">
          <img src="/logo.png" alt="logo" className="h-14 w-auto" />

          <div className="max-w-xl w-full mx-auto mt-22 bg-white rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                {user?.avatar ? (
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
                {followersList.length === 0 ? (
                  <p className="text-xs text-gray-400">You don&apos;t have any followers yet.</p>
                ) : (
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                    {followersList.map((f) => (
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

        {/* Posts */}
        <div className="px-6 pb-8 flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="max-w-xl w-full mx-auto bg-white rounded-2xl py-16 px-8 flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-16 w-16 rounded-full bg-gray-100 animate-ping opacity-20" />
                <div className="relative h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center animate-bounce">
                  <FiFeather size={24} className="text-gray-400" />
                </div>
              </div>
              <p className="text-sm font-semibold text-black mt-2">Nothing to see yet</p>
              <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
                Posts from people you follow will show up here.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="max-w-xl w-full mx-auto bg-white rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Link href={post.author_id === user?.id ? "/profile" : `/profile/${post.author_id}`} className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                    {post.author_avatar ? (
                      <img src={resolveImageUrl(post.author_avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      <FiUser size={20} className="text-gray-500" />
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link href={post.author_id === user?.id ? "/profile" : `/profile/${post.author_id}`} className="text-sm font-bold text-black hover:underline">{post.author_name}</Link>
                    <p className="text-xs text-gray-400">
                      @{post.author_handle} · {formatDate(post.created_at)} · {PRIVACY_LABELS[post.privacy]}
                    </p>
                  </div>
                  {post.author_id === user?.id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  )}
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
                          {c.author_avatar ? (
                            <img src={resolveImageUrl(c.author_avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                          ) : (
                            <FiUser size={13} className="text-gray-400" />
                          )}
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

      {/* Right sidebar */}
      <div className="w-72 shrink-0 flex flex-col gap-4 pt-6 pr-6 pb-6">
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 min-h-52">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBell size={16} className="text-black" />
              <h2 className="text-sm font-bold text-black">Notifications</h2>
            </div>
            <Link href="/notifications" className="text-xs text-gray-400 hover:text-black transition-colors">
              See all
            </Link>
          </div>
          <p className="text-xs text-gray-400 text-center py-3">No notifications yet.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 min-h-64">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiMessageCircle size={16} className="text-black" />
              <h2 className="text-sm font-bold text-black">Messages</h2>
            </div>
            <Link href="/messages" className="text-xs text-gray-400 hover:text-black transition-colors">
              See all
            </Link>
          </div>
          <p className="text-xs text-gray-400 text-center py-3">No conversations yet.</p>
        </div>
      </div>
    </div>
  );
}
