# WebSocket Store

Real-time WebSocket connection state with auto-reconnect and message history.

## Features
- Auto-reconnect with exponential backoff (up to 5 attempts)
- Message history (last 100 messages)
- Prevent duplicate connections
- Type-based message filtering selector

## Usage

```tsx
const { connect, disconnect, send, status, messages } = useWebSocketStore();

// Connect (call once on app mount)
useEffect(() => {
  connect("wss://api.example.com/ws");
  return () => disconnect();
}, []);

// Send a message
send("chat.message", { text: "Hello!" });

// Get latest message of a specific type
const latestChatMsg = useWebSocketStore(selectLatestMessageByType("chat.message"));
```

## Notes
- The WebSocket instance is stored outside Zustand state (module-level variable) to avoid serialisation issues
- Connect is idempotent: calling it when already connected does nothing
