"use client";
import Sidebar from "@/components/Sidebar";
import { FiUser, FiUsers, FiPlus, FiX, FiHeart, FiMessageCircle, FiCalendar, FiCheck, FiUserPlus } from "react-icons/fi";
import { useState } from "react";

type Tab = "posts" | "events" | "members";

type Post = {
  id: string;
  author: string;
  handle: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
};

type Event = {
  id: string;
  title: string;
  description: string;
  datetime: string;
  going: number;
  not_going: number;
  my_rsvp: "going" | "not_going" | null;
};

type Member = {
  id: string;
  name: string;
  handle: string;
  is_creator: boolean;
};

type JoinRequest = {
  id: string;
  name: string;
  handle: string;
};

export default function GroupDetail() {
  const [tab, setTab] = useState<Tab>("posts");

  // TODO: fetch group info from GET /api/groups/:id
  const isCreator = true;
  const groupTitle = "Paris Football Club Fans";
  const groupDescription = "Rouge et bleu dans le sang 🔴🔵 — discussions, matchs, transferts.";
  const isMember = true;

  // TODO: fetch from GET /api/groups/:id/posts
  const [posts] = useState<Post[]>([
    { id: "1", author: "Karim B.", handle: "@kb7", date: "13/05/2026 20h10", content: "Quel match hier soir, on a tout déchiré 🔥", likes: 34, comments: 8, liked: true },
    { id: "2", author: "Sarah M.", handle: "@sarahm", date: "12/05/2026 18h45", content: "Le nouveau transfert c'est officiel, bienvenue au club ! 🎉", likes: 72, comments: 21, liked: false },
    { id: "3", author: "Dempele", handle: "@dembouz", date: "11/05/2026 14h00", content: "Qui vient au prochain match ? On se retrouve devant le stade à 19h.", likes: 18, comments: 5, liked: false },
  ]);
  const [newPost, setNewPost] = useState("");

  // TODO: fetch from GET /api/groups/:id/events
  const [events] = useState<Event[]>([
    { id: "1", title: "Match Day — PSG vs Lyon", description: "Venez nombreux supporter l'équipe au Parc des Princes !", datetime: "Samedi 17 mai 2026 à 21h00", going: 14, not_going: 3, my_rsvp: "going" },
    { id: "2", title: "Watch party chez Karim", description: "Retransmission du match en déplacement, bonne ambiance garantie.", datetime: "Mercredi 21 mai 2026 à 20h45", going: 7, not_going: 1, my_rsvp: null },
  ]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDatetime, setEventDatetime] = useState("");

  // TODO: fetch from GET /api/groups/:id/members
  const [members] = useState<Member[]>([
    { id: "1", name: "Dempele", handle: "@dembouz", is_creator: true },
    { id: "2", name: "Karim B.", handle: "@kb7", is_creator: false },
    { id: "3", name: "Sarah M.", handle: "@sarahm", is_creator: false },
    { id: "4", name: "Lucas R.", handle: "@lucasr", is_creator: false },
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");

  // TODO: fetch from GET /api/groups/:id/requests (creator only)
  const [requests] = useState<JoinRequest[]>([
    { id: "1", name: "Mehdi A.", handle: "@mehdia" },
  ]);

  const handlePost = () => {
    if (!newPost.trim()) return;
    // TODO: call POST /api/groups/:id/posts
    setNewPost("");
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim() || !eventDatetime) return;
    // TODO: call POST /api/groups/:id/events
    setEventTitle("");
    setEventDesc("");
    setEventDatetime("");
    setShowCreateEvent(false);
  };

  const handleRsvp = (eventId: string, rsvp: "going" | "not_going") => {
    // TODO: call POST /api/groups/:id/events/:eventId/rsvp
    console.log(eventId, rsvp);
  };

  const handleRequest = (requestId: string, accept: boolean) => {
    // TODO: call POST /api/groups/:id/requests/:requestId/respond
    console.log(requestId, accept);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 px-8 pt-8 pb-8">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-6">

          {/* Group header */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <FiUsers size={24} className="text-gray-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-black">{groupTitle}</h1>
                  <p className="text-sm text-gray-400">{groupDescription}</p>
                  <p className="text-xs text-gray-400 mt-1">{members.length} members</p>
                </div>
              </div>
              {!isMember && (
                <button className="shrink-0 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
                  Request to join
                </button>
              )}
            </div>
          </div>

          {/* Join requests (creator only) */}
          {isCreator && requests.length > 0 && (
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-black">Pending requests ({requests.length})</p>
              {requests.map((req) => (
                <div key={req.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <FiUser size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">{req.name}</p>
                    <p className="text-xs text-gray-400">{req.handle}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(req.id, true)}
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(req.id, false)}
                      className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1">
            {(["posts", "events", "members"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === t ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Posts tab */}
          {tab === "posts" && (
            <div className="flex flex-col gap-4">
              {isMember && (
                <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <FiUser size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePost()}
                      placeholder="Share something with the group..."
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-black outline-none placeholder-gray-400"
                    />
                    <button
                      onClick={handlePost}
                      disabled={!newPost.trim()}
                      className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl py-12 flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-semibold text-black">No posts yet</p>
                  <p className="text-xs text-gray-400">Be the first to post in this group!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <FiUser size={15} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{post.author}</p>
                        <p className="text-xs text-gray-400">{post.handle} · {post.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-black">{post.content}</p>
                    <div className="flex items-center gap-5 text-gray-400 text-sm">
                      <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                        <FiHeart size={16} fill={post.liked ? "currentColor" : "none"} className={post.liked ? "text-red-500" : ""} />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-black transition-colors">
                        <FiMessageCircle size={16} />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Events tab */}
          {tab === "events" && (
            <div className="flex flex-col gap-4">
              {isMember && (
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="flex items-center justify-center gap-2 bg-white rounded-2xl p-4 text-sm font-medium text-gray-500 hover:text-black border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors"
                >
                  <FiPlus size={16} />
                  Create an event
                </button>
              )}

              {showCreateEvent && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-black text-lg">New event</h2>
                      <button onClick={() => setShowCreateEvent(false)} className="text-gray-400 hover:text-black">
                        <FiX size={20} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Title <span className="text-orange-500">*</span></label>
                        <input
                          type="text"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Description</label>
                        <textarea
                          value={eventDesc}
                          onChange={(e) => setEventDesc(e.target.value)}
                          rows={2}
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400 resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Date & Time <span className="text-orange-500">*</span></label>
                        <input
                          type="datetime-local"
                          value={eventDatetime}
                          onChange={(e) => setEventDatetime(e.target.value)}
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowCreateEvent(false)} className="px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateEvent}
                        disabled={!eventTitle.trim() || !eventDatetime}
                        className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {events.length === 0 ? (
                <div className="bg-white rounded-2xl py-12 flex flex-col items-center gap-2 text-center">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiCalendar size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-black">No events yet</p>
                  <p className="text-xs text-gray-400">Create an event for the group!</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <FiCalendar size={18} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black">{event.title}</p>
                        <p className="text-xs text-gray-400">{event.datetime}</p>
                        {event.description && <p className="text-xs text-gray-500 mt-1">{event.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRsvp(event.id, "going")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
                          event.my_rsvp === "going"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <FiCheck size={15} />
                        Going ({event.going})
                      </button>
                      <button
                        onClick={() => handleRsvp(event.id, "not_going")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors ${
                          event.my_rsvp === "not_going"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <FiX size={15} />
                        Not going ({event.not_going})
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Members tab */}
          {tab === "members" && (
            <div className="flex flex-col gap-3">
              {isMember && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="flex items-center justify-center gap-2 bg-white rounded-2xl p-4 text-sm font-medium text-gray-500 hover:text-black border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors"
                >
                  <FiUserPlus size={16} />
                  Invite someone
                </button>
              )}

              {showInvite && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-black text-lg">Invite someone</h2>
                      <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-black">
                        <FiX size={20} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={inviteSearch}
                      onChange={(e) => setInviteSearch(e.target.value)}
                      placeholder="Search by name or @handle..."
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black outline-none focus:border-gray-400"
                    />
                    {/* TODO: show search results and call POST /api/groups/:id/invite */}
                    <p className="text-xs text-gray-400 text-center">
                      {inviteSearch ? "No results found." : "Start typing to search users."}
                    </p>
                    <div className="flex justify-end">
                      <button onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {members.length === 0 ? (
                <div className="bg-white rounded-2xl py-12 flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-semibold text-black">No members yet</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <FiUser size={17} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.handle}</p>
                    </div>
                    {member.is_creator && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium shrink-0">
                        Creator
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
