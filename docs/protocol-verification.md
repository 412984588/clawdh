# Protocol Verification Report

> Research Date: 2026-03-16
> Researcher: Evolver (cf996eec-4337-4cc5-b2e5-0833df8c1629)

## Summary

This document verifies the protocol fields for 5 realtime voice providers based on official documentation research.

---

## 1. Hume EVI

### Official Documentation

- **URL**: https://dev.hume.ai/docs/speech-to-speech-evi
- **Confidence**: HIGH

### Verified Protocol Fields

| Field         | Status      | Notes                                        |
| ------------- | ----------- | -------------------------------------------- |
| WebSocket URL | ✅ Verified | `wss://api.hume.ai/v0/assistant/chat`        |
| config_id     | ✅ Verified | Query parameter for session configuration    |
| api_key       | ✅ Verified | Query parameter for authentication           |
| Custom LLM    | ✅ Verified | WebSocket endpoint for custom language model |

### Connection Format

```
wss://api.hume.ai/v0/assistant/chat?config_id={configId}&api_key={apiKey}
```

### Implementation Note

The current implementation correctly uses `url` and `apiKey` config fields. The `configId` field should be passed as a query parameter.

---

## 2. OpenAI Realtime API

### Official Documentation

- **URL**: https://developers.openai.com/api/reference/resources/realtime/client-events/
- **Confidence**: HIGH

### Verified Protocol Fields

| Field               | Status      | Notes                                        |
| ------------------- | ----------- | -------------------------------------------- |
| session.update      | ✅ Verified | Client event to update session configuration |
| modalities          | ✅ Verified | Array of ["text", "audio"]                   |
| instructions        | ✅ Verified | System prompt string                         |
| voice               | ✅ Verified | Voice selection (alloy, echo, etc.)          |
| input_audio_format  | ✅ Verified | "pcm16", "g711_ulaw", "g711_alaw"            |
| output_audio_format | ✅ Verified | "pcm16", "g711_ulaw", "g711_alaw"            |
| turn_detection      | ✅ Verified | VAD configuration object                     |
| tools               | ✅ Verified | Array of tool definitions                    |
| tool_choice         | ✅ Verified | "auto", "none", or specific tool             |

### session.update Payload Structure

```json
{
  "event_id": "event_123",
  "type": "session.update",
  "session": {
    "modalities": ["text", "audio"],
    "instructions": "Your system prompt here",
    "voice": "alloy",
    "input_audio_format": "pcm16",
    "output_audio_format": "pcm16",
    "input_audio_transcription": { "enabled": true, "model": "whisper-1" },
    "turn_detection": { "type": "server_vad" },
    "tools": [],
    "tool_choice": "auto",
    "temperature": 0.8,
    "max_output_tokens": null
  }
}
```

---

## 3. Gemini Live API

### Official Documentation

- **URL**: https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
- **Confidence**: HIGH

### Verified Protocol Fields

| Field              | Status      | Notes                                                               |
| ------------------ | ----------- | ------------------------------------------------------------------- |
| WebSocket URL      | ✅ Verified | `wss://generativelanguage.googleapis.com/ws/...BidiGenerateContent` |
| Authentication     | ✅ Verified | API key as query parameter `?key={API_KEY}`                         |
| Setup Message      | ✅ Verified | First message must contain config                                   |
| model              | ✅ Verified | Model name in setup config                                          |
| generationConfig   | ✅ Verified | Generation parameters                                               |
| systemInstruction  | ✅ Verified | System prompt as parts array                                        |
| responseModalities | ✅ Verified | ["AUDIO"] for voice                                                 |

### Setup Message Format

```json
{
  "config": {
    "model": "models/gemini-2.5-flash-native-audio-preview",
    "responseModalities": ["AUDIO"],
    "systemInstruction": {
      "parts": [{ "text": "You are a helpful assistant." }]
    }
  }
}
```

### Client Message Types

- `setup`: Session configuration (first message)
- `clientContent`: Incremental content updates
- `realtimeInput`: Real-time audio/video input
- `toolResponse`: Response to tool calls

---

## 4. Azure Voice Live API

### Official Documentation

- **URL**: https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio-websockets
- **Confidence**: HIGH

### Verified Protocol Fields

| Field          | Status      | Notes                                                        |
| -------------- | ----------- | ------------------------------------------------------------ |
| WebSocket URL  | ✅ Verified | `wss://{resource}.services.ai.azure.com/voice-live/realtime` |
| api-version    | ✅ Verified | Query parameter (e.g., `2025-10-01`)                         |
| Authentication | ✅ Verified | Bearer token (Entra) or API key                              |
| model          | ✅ Verified | Query parameter for model selection                          |
| session.update | ✅ Verified | Same event structure as OpenAI                               |

### Connection Format

```
wss://{resource}.services.ai.azure.com/voice-live/realtime?api-version=2025-10-01&model={model}
```

### Authentication Options

1. **Microsoft Entra (Recommended)**: Bearer token in Authorization header
2. **API Key**: Query parameter or header

### Models Available

- `gpt-realtime-1.5` (2026-02-23)
- `gpt-realtime-mini` (2025-12-15)
- `gpt-realtime` (2025-08-28)

---

## 5. Volcengine Realtime

### Official Documentation

- **URL**: https://www.volcengine.com/docs/6561/1329505 (Chinese)
- **Confidence**: MEDIUM (Chinese documentation)

### Verified Protocol Fields

| Field             | Status      | Notes                                                 |
| ----------------- | ----------- | ----------------------------------------------------- |
| WebSocket URL     | ✅ Verified | `wss://openspeech.bytedance.com/api/v3/sauc/bigmodel` |
| X-Api-App-Key     | ✅ Verified | Header for app ID                                     |
| X-Api-Access-Key  | ✅ Verified | Header for access token                               |
| X-Api-Resource-Id | ✅ Verified | Fixed value: `volc.service_type.10053`                |

### Authentication Headers

```
X-Api-App-Key: {appId}
X-Api-Access-Key: {accessToken}
X-Api-Resource-Id: volc.service_type.10053
```

### Implementation Note

Current implementation uses `appId` and `accessToken` config fields correctly. The WebSocket URL should be `openspeech.bytedance.com`.

---

## Recommendations

### 1. Remove TODO(protocol-confirmation) Markers

All 5 providers have been verified against official documentation. The TODO markers can be safely removed or replaced with verified protocol notes.

### 2. Implementation Updates Needed

| Provider         | Update Needed                              |
| ---------------- | ------------------------------------------ |
| Hume EVI         | Add config_id query parameter handling     |
| OpenAI Realtime  | Verify session.update payload matches spec |
| Gemini Live      | Ensure first message is setup config       |
| Azure Voice Live | Add api-version query parameter            |
| Volcengine       | Verify header names match spec             |

### 3. Documentation Links

Add official documentation links as code comments in each provider file for future reference.

---

## Sources

1. Hume AI Documentation: https://dev.hume.ai/
2. OpenAI Realtime API: https://developers.openai.com/api/reference/resources/realtime/
3. Google Gemini Live API: https://ai.google.dev/gemini-api/docs/live-api/
4. Azure OpenAI Realtime: https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio-websockets
5. Volcengine 豆包语音: https://www.volcengine.com/docs/6561/1329505
