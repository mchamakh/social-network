"use client";
import Sidebar from "@/components/Sidebar";
import ImageUploadButton from "@/components/ImageUploadButton";
import { FiUser, FiUsers, FiPlus, FiX, FiHeart, FiMessageCircle, FiCalendar, FiCheck, FiUserPlus, FiSend, FiImage, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket, type WsMessage } from "@/hooks/useWebSocket";
import {
  getGroup, getGroupPosts, createGroupPost, toggleGroupPostLike,
  getGroupPostComments, addGroupPostComment, getGroupEvents,
  createGroupEvent, respondToEvent, getPendingRequests,
  acceptJoinRequest, declineJoinRequest, inviteToGroup, getAllUsers,
  getGroupMessages, sendGroupMessage,
  type GroupDetail, type GroupPostResponse, type GroupCommentResponse,
  type GroupEventDetail, type MemberInfo, type GroupMessageResponse,
  resolveImageUrl,
} from "@/lib/api";

type Tab = "posts" | "events" | "members" | "chat";

const EMOJIS = ["😀", "😂", "❤️", "👍", "🔥", "🎉", "😭", "🥰", "😎", "🤔", "👀", "💯"];

export default function GroupDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [tab, setTab] = useState<Tab>("posts");
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<GroupPostResponse[]>([]);
  const [events, setEvents] = useState<GroupEventDetail[]>([]);
  const [requests, setRequests] = useState<MemberInfo[]>([]);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, GroupCommentResponse[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [newPost, setNewPost] = useState("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDatetime, setEventDatetime] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [allUsers, setAllUsers] = useState<{ id: string; first_name: string; last_name: string; nickname?: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<GroupMessageResponse[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatInputImage, setChatInputImage] = useState<string | null>(null);
  const [chatSending, setChatSending] = useState(false);
  const [showChatEmoji, setShowChatEmoji] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const fetchGroup = useCallback(async () => {
    try { setGroup(await getGroup(groupId)); } catch {}
  }, [groupId]);

  const fetchPosts = useCallback(async () => {
    try { setPosts(await getGroupPosts(groupId) ?? []); } catch {}
  }, [groupId]);

  const fetchEvents = useCallback(async () => {
    try { setEvents(await getGroupEvents(groupId) ?? []); } catch {}
  }, [groupId]);

  const fetchRequests = useCallback(async () => {
    try { setRequests(await getPendingRequests(groupId) ?? []); } catch {}
  }, [groupId]);

  const fetchChat = useCallback(async () => {
    try { setChatMessages(await getGroupMessages(groupId) ?? []); } catch {}
  }, [groupId]);

  useEffect(() => {
    if (!user) return;
    fetchGroup();
    fetchPosts();
    fetchEvents();
    getAllUsers().then(setAllUsers).catch(() => {});
  }, [user, fetchGroup, fetchPosts, fetchEvents]);

  useEffect(() => {
    if (!user || !group || group.creator_id !== user.id) return;
    fetchRequests();
  }, [user, group, fetchRequests]);

  const isMember = group?.my_status === "accepted";
  const isCreator = group?.creator_id === user?.id;

  useEffect(() => {
    if (!isMember) return;
    fetchChat();
  }, [isMember, fetchChat]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type !== "chat_group") return;
    try {
      const gm: GroupMessageResponse = JSON.parse(msg.payload);
      if (gm.group_id !== groupId) return;
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === gm.id)) return prev;
        return [...prev, gm];
      });
    } catch {}
  }, [groupId]);

  useWebSocket(handleWsMessage);

  const handleChatSend = async () => {
    if ((!chatInput.trim() && !chatInputImage) || chatSending) return;
    setChatSending(true);
    const content = chatInput.trim();
    const image = chatInputImage ?? undefined;
    setChatInput("");
    setChatInputImage(null);
    try {
      const msg = await sendGroupMessage(groupId, content, image);
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch {
      setChatInput(content);
      setChatInputImage(image ?? null);
    } finally {
      setChatSending(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !newPostImage) return;
    setPosting(true);
    try { await createGroupPost(groupId, newPost.trim(), newPostImage ?? undefined); setNewPost(""); setNewPostImage(null); fetchPosts(); }
    catch {} finally { setPosting(false); }
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 } : p
    ));
    try { await toggleGroupPostLike(groupId, postId); } catch { fetchPosts(); }
  };

  const toggleComments = async (postId: string) => {
    if (openComments === postId) { setOpenComments(null); return; }
    setOpenComments(postId);
    if (!comments[postId]) {
      try {
        const data = await getGroupPostComments(groupId, postId);
        setComments((prev) => ({ ...prev, [postId]: data ?? [] }));
      } catch {}
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentInput[postId]?.trim();
    if (!text) return;
    try {
      await addGroupPostComment(groupId, postId, text);
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      const data = await getGroupPostComments(groupId, postId);
      setComments((prev) => ({ ...prev, [postId]: data ?? [] }));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch {}
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDatetime) return;
    try {
      await createGroupEvent(groupId, { title: eventTitle.trim(), description: eventDesc.trim() || undefined, event_time: new Date(eventDatetime).toISOString() });
      setEventTitle(""); setEventDesc(""); setEventDatetime(""); setShowCreateEvent(false);
      fetchEvents();
    } catch {}
  };

  const handleRsvp = async (eventId: string, response: "going" | "not_going") => {
    try {
      await respondToEvent(groupId, eventId, response);
      fetchEvents();
    } catch {}
  };

  const handleAcceptRequest = async (userId: string) => {
    try { await acceptJoinRequest(groupId, userId); fetchRequests(); fetchGroup(); } catch {}
  };

  const handleDeclineRequest = async (userId: string) => {
    try { await declineJoinRequest(groupId, userId); fetchRequests(); } catch {}
  };

  const handleInvite = async (userId: string) => {
    try { await inviteToGroup(groupId, userId); setShowInvite(false); } catch {}
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const memberIds = new Set(group?.members.map((m) => m.user_id) ?? []);
  const inviteResults = allUsers.filter((u) =>
    !memberIds.has(u.id) && u.id !== user?.id &&
    (`${u.first_name} ${u.last_name}`.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      (u.nickname ?? "").toLowerCase().includes(inviteSearch.toLowerCase()))
  );

  if (loading || !group) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen"><Sidebar /></div>

      <div className="flex flex-col flex-1 px-8 pt-8 pb-8">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <FiUsers size={24} className="text-gray-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-black">{group.title}</h1>
                  {group.description && <p className="text-sm text-gray-400">{group.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{group.member_count} members</p>
                </div>
              </div>
              {!group.my_status && (
                <button onClick={() => { import("@/lib/api").then(({ requestJoinGroup }) => requestJoinGroup(groupId).then(fetchGroup).catch(() => {})); }} className="shrink-0 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
                  Request to join
                </button>
              )}
              {group.my_status === "requested" && (
                <span className="shrink-0 text-xs bg-gray-100 text-gray-400 px-4 py-2 rounded-full font-medium">Pending</span>
              )}
            </div>
          </div>

          {/* Pending requests (creator only) */}
          {isCreator && requests.length > 0 && (
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-black">Pending requests ({requests.length})</p>
              {requests.map((req) => (
                <div key={req.user_id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <FiUser size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">{req.first_name} {req.last_name}</p>
                    {req.nickname && <p className="text-xs text-gray-400">@{req.nickname}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptRequest(req.user_id)} className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors">Accept</button>
                    <button onClick={() => handleDeclineRequest(req.user_id)} className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1">
            {(["posts", "events", "members", "chat"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}>{t}</button>
            ))}
          </div>

          {/* Posts */}
          {tab === "posts" && (
            <div className="flex flex-col gap-4">
              {isMember && (
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      {user?.avatar ? <img src={resolveImageUrl(user.avatar)} className="w-full h-full rounded-full object-cover" alt="" /> : <FiUser size={16} className="text-gray-500" />}
                    </div>
                    <input type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePost()} placeholder="Share something with the group..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-black outline-none placeholder-gray-400" />
                  </div>
                  {newPostImage && (
                    <div className="relative w-fit">
                      <img src={resolveImageUrl(newPostImage)} alt="" className="max-h-40 rounded-xl object-contain bg-gray-100" />
                      <button onClick={() => setNewPostImage(null)} className="absolute top-1 right-1 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors">
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-1">
                    <ImageUploadButton
                      onUploaded={(url) => setNewPostImage(url)}
                      className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-sm"
                    >
                      <FiImage size={18} />
                      <span>Photo</span>
                    </ImageUploadButton>
                    <button onClick={handlePost} disabled={(!newPost.trim() && !newPostImage) || posting} className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">Post</button>
                  </div>
                </div>
              )}
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl py-12 flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-semibold text-black">No posts yet</p>
                  <p className="text-xs text-gray-400">Be the first to post in this group!</p>
                </div>
              ) : posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      {post.author_avatar ? <img src={resolveImageUrl(post.author_avatar)} className="w-full h-full rounded-full object-cover" alt="" /> : <FiUser size={15} className="text-gray-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">{post.author_name}</p>
                      <p className="text-xs text-gray-400">@{post.author_handle} · {formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-black">{post.content}</p>
                  {post.image && (
                    <img src={resolveImageUrl(post.image)} alt="" className="w-full rounded-xl object-contain bg-gray-100 max-h-[28rem]" />
                  )}
                  <div className="flex items-center gap-5 text-gray-400 text-sm">
                    <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 transition-colors ${post.liked ? "text-red-500" : "hover:text-red-400"}`}>
                      <FiHeart size={16} fill={post.liked ? "currentColor" : "none"} /><span>{post.likes_count}</span>
                    </button>
                    <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 hover:text-black transition-colors">
                      <FiMessageCircle size={16} /><span>{post.comments_count}</span>
                      {openComments === post.id ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                    </button>
                  </div>
                  {openComments === post.id && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                      {(comments[post.id] ?? []).map((c) => (
                        <div key={c.id} className="flex items-start gap-2">
                          <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0"><FiUser size={13} className="text-gray-400" /></div>
                          <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                            <p className="text-xs font-semibold text-black">{c.author_name}</p>
                            <p className="text-xs text-gray-600">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-1">
                        <input value={commentInput[post.id] ?? ""} onChange={(e) => setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)} placeholder="Write a comment…" className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-black outline-none placeholder-gray-400" />
                        <button onClick={() => handleComment(post.id)} disabled={!commentInput[post.id]?.trim()} className="h-7 w-7 bg-black rounded-full flex items-center justify-center text-white disabled:opacity-40"><FiSend size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Events */}
          {tab === "events" && (
            <div className="flex flex-col gap-4">
              {isMember && (
                <button onClick={() => setShowCreateEvent(true)} className="flex items-center justify-center gap-2 bg-white rounded-2xl p-4 text-sm font-medium text-gray-500 hover:text-black border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors">
                  <FiPlus size={16} /> Create an event
                </button>
              )}
              {showCreateEvent && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-black text-lg">New event</h2>
                      <button onClick={() => setShowCreateEvent(false)} className="text-gray-400 hover:text-black"><FiX size={20} /></button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Title <span className="text-orange-500">*</span></label>
                        <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Description</label>
                        <textarea value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} rows={2} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400 resize-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Date & Time <span className="text-orange-500">*</span></label>
                        <input type="datetime-local" value={eventDatetime} onChange={(e) => setEventDatetime(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowCreateEvent(false)} className="px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                      <button onClick={handleCreateEvent} disabled={!eventTitle.trim() || !eventDatetime} className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Create</button>
                    </div>
                  </div>
                </div>
              )}
              {events.length === 0 ? (
                <div className="bg-white rounded-2xl py-12 flex flex-col items-center gap-2 text-center">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"><FiCalendar size={18} className="text-gray-400" /></div>
                  <p className="text-sm font-semibold text-black">No events yet</p>
                </div>
              ) : events.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0"><FiCalendar size={18} className="text-gray-400" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black">{event.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(event.event_time)}</p>
                      {event.description && <p className="text-xs text-gray-500 mt-1">{event.description}</p>}
                    </div>
                  </div>
                  {isMember && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRsvp(event.id, "going")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${event.my_response === "going" ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        <FiCheck size={15} /> Going ({event.going})
                      </button>
                      <button onClick={() => handleRsvp(event.id, "not_going")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${event.my_response === "not_going" ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        <FiX size={15} /> Not going ({event.not_going})
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Members */}
          {tab === "members" && (
            <div className="flex flex-col gap-3">
              {isMember && (
                <button onClick={() => setShowInvite(true)} className="flex items-center justify-center gap-2 bg-white rounded-2xl p-4 text-sm font-medium text-gray-500 hover:text-black border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors">
                  <FiUserPlus size={16} /> Invite someone
                </button>
              )}
              {showInvite && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-black text-lg">Invite someone</h2>
                      <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-black"><FiX size={20} /></button>
                    </div>
                    <input type="text" value={inviteSearch} onChange={(e) => setInviteSearch(e.target.value)} placeholder="Search by name..." className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400" />
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {inviteSearch && inviteResults.length === 0 && <p className="text-xs text-gray-400 text-center">No results.</p>}
                      {inviteResults.map((u) => (
                        <div key={u.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0"><FiUser size={14} className="text-gray-500" /></div>
                          <p className="text-sm text-black flex-1">{u.first_name} {u.last_name}{u.nickname ? ` (@${u.nickname})` : ""}</p>
                          <button onClick={() => handleInvite(u.id)} className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors">Invite</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end"><button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors">Close</button></div>
                  </div>
                </div>
              )}
              {group.members.map((member) => (
                <div key={member.user_id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    {member.avatar ? <img src={resolveImageUrl(member.avatar)} className="w-full h-full rounded-full object-cover" alt="" /> : <FiUser size={17} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black">{member.first_name} {member.last_name}</p>
                    {member.nickname && <p className="text-xs text-gray-400">@{member.nickname}</p>}
                  </div>
                  {member.is_creator && <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium shrink-0">Creator</span>}
                </div>
              ))}
            </div>
          )}

          {/* Chat */}
          {tab === "chat" && (
            <div className="bg-white rounded-2xl flex flex-col h-[32rem]">
              {!isMember ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-8">
                  <FiMessageCircle size={22} className="text-gray-400" />
                  <p className="text-sm font-semibold text-black">Members only</p>
                  <p className="text-xs text-gray-400">Join this group to see and send messages.</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                    {chatMessages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                        <p className="text-sm text-gray-400">No messages yet. Say hello 👋</p>
                      </div>
                    ) : chatMessages.map((msg) => {
                      const isMine = msg.author_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-black text-white rounded-br-sm" : "bg-gray-50 text-black rounded-bl-sm"}`}>
                            {!isMine && <p className="text-xs font-semibold opacity-70 mb-0.5">{msg.author_name}</p>}
                            {msg.image && (
                              <img src={resolveImageUrl(msg.image)} alt="" className="rounded-lg max-h-52 max-w-full object-contain bg-gray-100 mb-1.5" />
                            )}
                            {msg.content && <p>{msg.content}</p>}
                            <p className="text-xs mt-1 opacity-50">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>

                  <div className="border-t border-gray-100 px-5 py-4 shrink-0">
                    {showChatEmoji && (
                      <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-xl">
                        {EMOJIS.map((e) => (
                          <button key={e} onClick={() => { setChatInput((p) => p + e); setShowChatEmoji(false); }} className="text-lg hover:scale-125 transition-transform">{e}</button>
                        ))}
                      </div>
                    )}
                    {chatInputImage && (
                      <div className="relative w-fit mb-3">
                        <img src={resolveImageUrl(chatInputImage)} alt="" className="max-h-28 rounded-xl object-contain bg-gray-100" />
                        <button
                          onClick={() => setChatInputImage(null)}
                          className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowChatEmoji((v) => !v)}
                        className="text-gray-400 hover:text-black transition-colors text-lg shrink-0"
                      >😊</button>
                      <ImageUploadButton
                        onUploaded={(url) => setChatInputImage(url)}
                        className="text-gray-400 hover:text-black transition-colors shrink-0"
                      >
                        <FiImage size={18} />
                      </ImageUploadButton>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                        placeholder="Message the group..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-black outline-none placeholder-gray-400"
                      />
                      <button
                        onClick={handleChatSend}
                        disabled={(!chatInput.trim() && !chatInputImage) || chatSending}
                        className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <FiSend size={15} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
