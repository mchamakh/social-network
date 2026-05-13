"use client";
import Sidebar from "@/components/Sidebar";
import { FiUser, FiSend, FiMessageCircle } from "react-icons/fi";
import { useState } from "react";

type Conversation = {
  id: string;
  name: string;
  handle: string;
  last_message: string;
  date: string;
  unread: number;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  date: string;
};

export default function Messages() {
  // TODO: fetch from GET /api/messages/conversations
  const [conversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  // TODO: fetch from GET /api/messages/:conversationId
  const [messages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !selected) return;
    // TODO: call POST /api/messages/:conversationId
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Conversations list */}
      <div className="w-72 shrink-0 bg-white flex flex-col border-r border-gray-100">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-black">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center pb-10">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FiMessageCircle size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-black">No messages yet</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your conversations will appear here.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                  selected?.id === conv.id ? "bg-gray-50" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <FiUser size={17} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-black truncate">{conv.name}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{conv.date}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Chat header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                <FiUser size={16} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-black">{selected.name}</p>
                <p className="text-xs text-gray-400">{selected.handle}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <p className="text-sm text-gray-400">Start the conversation 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender_id === "me"
                          ? "bg-black text-white rounded-br-sm"
                          : "bg-white text-black rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === "me" ? "text-gray-400" : "text-gray-400"}`}>
                        {msg.date}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="bg-white px-6 py-4 border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
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
                  disabled={!input.trim()}
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
              Select a conversation on the left to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
