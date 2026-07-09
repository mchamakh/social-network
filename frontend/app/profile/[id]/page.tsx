"use client";
import Sidebar from "@/components/Sidebar";
import FollowButton from "@/components/FollowButton";
import FollowListModal, { type FollowListUser } from "@/components/FollowListModal";
import {
  FiUser,
  FiMessageCircle,
  FiHeart,
  FiLock,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import {
  getUserById,
  getFollowStatus,
  getUserPosts,
  getFollowers,
  getFollowing,
  toggleLike,
  getComments,
  addComment,
  type UserProfile,
  type FollowStatus,
  type PostResponse,
  type CommentResponse,
  resolveImageUrl,
} from "@/lib/api";

const PRIVACY_LABELS = {
  public: "Public",
  almost_private: "Followers",
  private: "Custom",
};

export default function PublicProfile() {
  const { user: me, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<FollowStatus>("none");
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [followers, setFollowers] = useState<FollowListUser[]>([]);
  const [following, setFollowing] = useState<FollowListUser[]>([]);
  const [canViewLists, setCanViewLists] = useState(true);
  const [modal, setModal] = useState<"followers" | "following" | null>(null);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, CommentResponse[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !me) router.push("/login");
  }, [authLoading, me, router]);

  useEffect(() => {
    if (me && profileId === me.id) router.replace("/profile");
  }, [me, profileId, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([getUserById(profileId), getFollowStatus(profileId)]);
      setProfile(p);
      setStatus(s);

      try {
        const [followersData, followingData] = await Promise.all([
          getFollowers(profileId),
          getFollowing(profileId),
        ]);
        setFollowers(followersData);
        setFollowing(followingData);
        setCanViewLists(true);
      } catch {
        setCanViewLists(false);
      }

      try {
        setPosts((await getUserPosts(profileId)) ?? []);
      } catch {
        setPosts([]);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (me && profileId !== me.id) load();
  }, [me, profileId, load]);

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
      await load();
    }
  };

  const toggleCommentsFor = async (postId: string) => {
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
    if (!text) return;
    try {
      await addComment(postId, text);
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      const data = await getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: data ?? [] }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
    } catch {}
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (authLoading || loading || !me || profileId === me.id) return null;

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          User not found.
        </div>
      </div>
    );
  }

  const displayName = `${profile.first_name} ${profile.last_name}`;
  const handle = profile.nickname ?? profile.email;
  const locked = profile.is_private && !canViewLists;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-3 pt-0">
        <div className="shrink-0">
          <div className="w-full h-48 bg-gray-300 rounded-b-2xl overflow-hidden">
            {profile.banner && (
              <img src={resolveImageUrl(profile.banner)} alt="" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex flex-col px-8">
            <div className="flex items-end justify-between -mt-12">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center shrink-0">
                  {profile.avatar ? (
                    <img src={resolveImageUrl(profile.avatar)} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <FiUser size={40} className="text-gray-500" />
                  )}
                </div>
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-black">{displayName}</h1>
                  <p className="text-gray-400 text-sm">@{handle}</p>
                </div>
              </div>

              <FollowButton userId={profile.id} status={status} onChange={(s) => { setStatus(s); load(); }} />
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {!locked && profile.about_me && <p className="text-sm text-black">{profile.about_me}</p>}
              <div className="flex gap-4 text-sm text-gray-400">
                {!locked && profile.birthday && <span>Born {profile.birthday}</span>}
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => canViewLists && setModal("followers")}
                  className="text-black font-semibold hover:underline disabled:no-underline"
                  disabled={!canViewLists}
                >
                  {canViewLists ? followers.length : "—"} <span className="text-gray-400 font-normal">followers</span>
                </button>
                <button
                  onClick={() => canViewLists && setModal("following")}
                  className="text-black font-semibold hover:underline disabled:no-underline"
                  disabled={!canViewLists}
                >
                  {canViewLists ? following.length : "—"} <span className="text-gray-400 font-normal">following</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-6">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
            {locked ? (
              <div className="bg-white rounded-2xl py-16 px-8 flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiLock size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-black">This account is private</p>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                  Follow {profile.first_name} to see their posts, followers and following.
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
                No posts yet.
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      {profile.avatar ? (
                        <img src={resolveImageUrl(profile.avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                      ) : (
                        <FiUser size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black">{displayName}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(post.created_at)} · {PRIVACY_LABELS[post.privacy]}
                      </p>
                    </div>
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
                      onClick={() => toggleCommentsFor(post.id)}
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
                            <p className="text-xs text-gray-600">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          value={commentInput[post.id] ?? ""}
                          onChange={(e) =>
                            setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                          placeholder="Write a comment…"
                          className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-black outline-none placeholder-gray-400"
                        />
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
