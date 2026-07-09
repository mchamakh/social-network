"use client";
import { useEffect, useRef, useCallback } from "react";
import { getAccessToken, setAccessToken } from "@/lib/auth";
import { refreshAccessToken } from "@/lib/api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";

export type WsMessage = {
  type: "chat_private" | "chat_group" | "notification" | "typing" | "feed_update";
  sender_id: string;
  target_id?: string;
  group_id?: string;
  payload: string;
  created_at: string;
};

type Handler = (msg: WsMessage) => void;

// A single browser tab must only hold one physical connection per user —
// the backend hub keeps one Client per user id and the latest Register
// wins, so extra connections silently stop receiving routed messages.
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let connecting = false;
const listeners = new Set<Handler>();

function scheduleReconnect() {
  if (reconnectTimer) return; // an attempt is already queued, never stack more than one
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 3000);
}

async function connect() {
  const settling = socket && socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING;
  if (!getAccessToken() || listeners.size === 0 || settling || connecting) return;

  connecting = true;
  try {
    // A browser WebSocket close event carries no HTTP status, so a stale
    // (expired) token would otherwise fail and retry forever every 3s.
    // Refreshing before every attempt guarantees we always try with a live
    // token, and lets a genuinely dead session (refresh itself rejected)
    // stop retrying instead of looping.
    const token = await refreshAccessToken();
    if (!token) {
      setAccessToken(null);
      return;
    }
    if (listeners.size === 0) return; // nothing left listening while we awaited

    const ws = new WebSocket(`${WS_URL}/api/ws?token=${token}`);
    socket = ws;

    ws.onmessage = (e) => {
      try {
        const msg: WsMessage = JSON.parse(e.data);
        listeners.forEach((fn) => fn(msg));
      } catch {}
    };

    ws.onclose = () => {
      if (socket === ws) socket = null;
      if (listeners.size > 0) scheduleReconnect();
    };

    ws.onerror = () => ws.close();
  } finally {
    connecting = false;
  }
}

export function useWebSocket(onMessage: Handler) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const wrapped: Handler = (msg) => onMessageRef.current(msg);
    listeners.add(wrapped);
    connect();

    return () => {
      listeners.delete(wrapped);
      if (listeners.size === 0) {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        socket?.close();
        socket = null;
      }
    };
  }, []);

  const send = useCallback((msg: Omit<WsMessage, "created_at">) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
    }
  }, []);

  return { send };
}
