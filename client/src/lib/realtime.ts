import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

let socket: Socket | null = null;
let statusListeners: ((status: string) => void)[] = [];

export function connectRealtime(token?: string) {
  if (socket) return socket;
  socket = io("/", {
    path: "/socket.io",
    transports: ["websocket"],
    auth: token ? { token } : undefined,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
  socket.on("connect", () => notifyStatus("connected"));
  socket.on("disconnect", () => notifyStatus("disconnected"));
  socket.on("reconnect_attempt", () => notifyStatus("reconnecting"));
  socket.on("error", () => notifyStatus("error"));
  return socket;
}

function notifyStatus(status: string) {
  statusListeners.forEach(fn => fn(status));
}

export function subscribePortfolioUpdates(userId: number, onUpdate: (data: any) => void) {
  if (!socket) throw new Error("Socket not connected");
  socket.emit("subscribe:portfolio");
  socket.on("portfolio:update", onUpdate);
}

export function disconnectRealtime() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function useRealtimeStatus(): string {
  const [status, setStatus] = useState("disconnected");
  useEffect(() => {
    const fn = (s: string) => setStatus(s);
    statusListeners.push(fn);
    return () => {
      statusListeners = statusListeners.filter(f => f !== fn);
    };
  }, []);
  return status;
}
