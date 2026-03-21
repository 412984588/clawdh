import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface RealtimeMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

interface WebSocketState {
  status: ConnectionStatus;
  messages: RealtimeMessage[];
  error: string | null;
  reconnectAttempts: number;
}

interface WebSocketActions {
  connect: (url: string) => void;
  disconnect: () => void;
  send: (type: string, payload: unknown) => void;
  clearMessages: () => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 2000;

let wsInstance: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export const useWebSocketStore = create<WebSocketState & WebSocketActions>()(
  devtools(
    (set, get) => ({
      status: "disconnected",
      messages: [],
      error: null,
      reconnectAttempts: 0,

      connect: (url) => {
        // Prevent duplicate connections
        if (wsInstance?.readyState === WebSocket.OPEN) return;

        set({ status: "connecting", error: null }, false, "ws/connecting");

        wsInstance = new WebSocket(url);

        wsInstance.onopen = () => {
          set({ status: "connected", reconnectAttempts: 0 }, false, "ws/connected");
        };

        wsInstance.onmessage = (event) => {
          try {
            const message: RealtimeMessage = JSON.parse(event.data);
            set((s) => ({
              messages: [...s.messages.slice(-99), message], // keep last 100
            }), false, "ws/message");
          } catch (err) {
            console.error("Failed to parse WS message:", err);
          }
        };

        wsInstance.onclose = () => {
          set({ status: "disconnected" }, false, "ws/closed");
          // Auto-reconnect
          const { reconnectAttempts } = get();
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectTimer = setTimeout(() => {
              set((s) => ({ reconnectAttempts: s.reconnectAttempts + 1 }), false, "ws/reconnecting");
              get().connect(url);
            }, RECONNECT_DELAY_MS * (reconnectAttempts + 1));
          }
        };

        wsInstance.onerror = () => {
          set({ status: "error", error: "WebSocket connection error" }, false, "ws/error");
        };
      },

      disconnect: () => {
        if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
        wsInstance?.close();
        wsInstance = null;
        set({ status: "disconnected", reconnectAttempts: 0 }, false, "ws/disconnected");
      },

      send: (type, payload) => {
        if (wsInstance?.readyState !== WebSocket.OPEN) {
          console.warn("WebSocket not connected, cannot send message");
          return;
        }
        wsInstance.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
      },

      clearMessages: () => set({ messages: [] }, false, "ws/clearMessages"),
    }),
    { name: "WebSocketStore" }
  )
);

export const selectLatestMessageByType = (type: string) => (s: WebSocketState) => {
  const filtered = s.messages.filter((m) => m.type === type);
  return filtered[filtered.length - 1];
};
export const selectIsConnected = (s: WebSocketState) => s.status === "connected";
