"use client";
import Sidebar from "@/components/Sidebar";
import ImageUploadButton from "@/components/ImageUploadButton";
import { FiUser, FiSend, FiMessageCircle, FiSearch, FiImage, FiX } from "react-icons/fi";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket, type WsMessage } from "@/hooks/useWebSocket";
import {
  getConversations, getPrivateHistory, sendPrivateMessage, getAllUsers,
  type ConversationPreview, type PrivateMessage,
  resolveImageUrl,
} from "@/lib/api";
import { useRouter } from "next/navigation";

const EMOJIS = ["😀","😂","❤️","👍","🔥","🎉","😭","🥰","😎","🤔","👀","💯"];

export default function Messages() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selected, setSelected] = useState<ConversationPreview | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [input, setInput] = useState("");
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<{ id: string; first_name: string; last_name: string; nickname?: string }[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const fetchConversations = useCallback(async () => {
    try { setConversations(await getConversations() ?? []); } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
      getAllUsers().then(setAllUsers).catch(() => {});
    }
  }, [user, fetchConversations]);

  // Load history when a conversation is selected
  useEffect(() => {
    if (!selected) return;
    getPrivateHistory(selected.other_user_id)
      .then((data) => setMessages(data ?? []))
      .catch(() => {});
  }, [selected]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket: receive incoming messages in real time
  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type !== "chat_private") return;
    try {
      const pm: PrivateMessage = JSON.parse(msg.payload);
      // Add to current conversation if it matches
      setMessages((prev) => {
        if (
          selected &&
          (pm.sender_id === selected.other_user_id || pm.receiver_id === selected.other_user_id)
        ) {
          if (prev.some((m) => m.id === pm.id)) return prev;
          return [...prev, pm];
        }
        return prev;
      });
      fetchConversations();
    } catch {}
  }, [selected, fetchConversations]);

  useWebSocket(handleWsMessage);

  const handleSend = async () => {
    if ((!input.trim() && !inputImage) || !selected || sending) return;
    setSending(true);
    const content = input.trim();
    const image = inputImage ?? undefined;
    setInput("");
    setInputImage(null);
    try {
      const msg = await sendPrivateMessage(selected.other_user_id, content, image);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      fetchConversations();
    } catch {
      setInput(content);
      setInputImage(image ?? null);
    } finally {
      setSending(false);
    }
  };

  const handleSelectUser = async (u: { id: string; first_name: string; last_name: string; nickname?: string }) => {
    const existing = conversations.find((c) => c.other_user_id === u.id);
    const conv: ConversationPreview = existing ?? {
      other_user_id: u.id,
      other_name: `${u.first_name} ${u.last_name}`,
      other_handle: u.nickname ?? u.id,
      last_message: "",
      last_message_at: new Date().toISOString(),
      unread: 0,
    };
    setSelected(conv);
    setShowNewChat(false);
    setSearch("");
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.id !== user?.id &&
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Conversations list */}
      <div className="w-72 shrink-0 bg-white flex flex-col border-r border-gray-100">
        <div className="flex flex-col items-center pt-5 pb-3 border-b border-gray-100 gap-3 px-4">
          <img src="/logo.png" alt="logo" className="h-10 w-auto" />
          <h1 className="text-lg font-bold text-black">Messages</h1>
          <button
            onClick={() => setShowNewChat((v) => !v)}
            className="w-full text-xs bg-black text-white py-2 rounded-full font-medium hover:bg-zinc-800 transition-colors"
          >
            New conversation
          </button>
          {showNewChat && (
            <div className="w-full flex flex-col gap-2">
              <div className="relative">
                <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users…"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-100 rounded-lg outline-none text-black placeholder-gray-400"
                />
              </div>
              {search && (
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No results</p>
                  ) : filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <FiUser size={12} className="text-gray-500" />
                      </div>
                      <span className="text-xs text-black">{u.first_name} {u.last_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center pb-10">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FiMessageCircle size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-black">No messages yet</p>
              <p className="text-xs text-gray-400 leading-relaxed">Start a new conversation above.</p>
            </div>
          ) : conversations.map((conv) => (
            <button
              key={conv.other_user_id}
              onClick={() => setSelected(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selected?.other_user_id === conv.other_user_id ? "bg-gray-50" : ""}`}
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                {conv.other_avatar ? (
                  <img src={resolveImageUrl(conv.other_avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  <FiUser size={17} className="text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-black truncate">{conv.other_name}</p>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{formatTime(conv.last_message_at)}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
              </div>
              {conv.unread > 0 && (
                <span className="h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center shrink-0">{conv.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                {selected.other_avatar ? (
                  <img src={resolveImageUrl(selected.other_avatar)} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  <FiUser size={16} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-black">{selected.other_name}</p>
                <p className="text-xs text-gray-400">@{selected.other_handle}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <p className="text-sm text-gray-400">Start the conversation 👋</p>
                </div>
              ) : messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-black text-white rounded-br-sm" : "bg-white text-black rounded-bl-sm shadow-sm"}`}>
                      {msg.image && (
                        <img src={resolveImageUrl(msg.image)} alt="" className="rounded-lg max-h-52 max-w-full object-contain bg-gray-100 mb-1.5" />
                      )}
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-50">{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="bg-white px-6 py-4 border-t border-gray-100 shrink-0">
              {showEmoji && (
                <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-xl">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => { setInput((p) => p + e); setShowEmoji(false); }} className="text-lg hover:scale-125 transition-transform">{e}</button>
                  ))}
                </div>
              )}
              {inputImage && (
                <div className="relative w-fit mb-3">
                  <img src={resolveImageUrl(inputImage)} alt="" className="max-h-28 rounded-xl object-contain bg-gray-100" />
                  <button
                    onClick={() => setInputImage(null)}
                    className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEmoji((v) => !v)}
                  className="text-gray-400 hover:text-black transition-colors text-lg shrink-0"
                >😊</button>
                <ImageUploadButton
                  onUploaded={(url) => setInputImage(url)}
                  className="text-gray-400 hover:text-black transition-colors shrink-0"
                >
                  <FiImage size={18} />
                </ImageUploadButton>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Write a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-black outline-none placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !inputImage) || sending}
                  className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <FiSend size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
              <FiMessageCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-black">Your messages</p>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              Select a conversation or start a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
