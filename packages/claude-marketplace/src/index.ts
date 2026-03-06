/**
 * @voice-hub/claude-marketplace
 *
 * Claude Code Marketplace 集成
 * 提供插件元数据和安装配置
 */

/** 插件清单 */
export const MANIFEST = {
  id: "voice-hub",
  name: "Voice Hub",
  version: "0.2.0",
  description:
    "Real-time voice interaction middleware for Claude Code and OpenClaw",
  author: "Voice Hub Team",
  license: "MIT",
  homepage: "https://github.com/voice-hub/voice-hub",
  repository: "https://github.com/voice-hub/voice-hub",
  keywords: [
    "voice",
    "audio",
    "discord",
    "realtime",
    "openclaw",
    "claude-code",
    "mcp",
  ],

  capabilities: {
    voiceInput: true,
    voiceOutput: true,
    sessionManagement: true,
    memoryStorage: true,
    backendDispatch: true,
  },

  compatibility: {
    claudeCode: ">=1.0.0",
    openclaw: ">=0.1.0",
    node: ">=22.12.0",
  },

  dependencies: {
    runtime: ["@voice-hub/core-runtime"],
    optional: ["@voice-hub/openclaw-plugin", "@voice-hub/claude-mcp-server"],
  },

  installation: {
    type: "npm",
    package: "@voice-hub/claude-marketplace",
  },

  configuration: {
    env: [
      "DISCORD_BOT_TOKEN",
      "DISCORD_GUILD_ID",
      "DISCORD_VOICE_CHANNEL_ID",
      "VOICE_PROVIDER",
      "VOLCENGINE_REALTIME_WS_URL",
      "VOLCENGINE_APP_ID",
      "VOLCENGINE_ACCESS_TOKEN",
      "OPENAI_REALTIME_WS_URL",
      "OPENAI_API_KEY",
      "GEMINI_LIVE_WS_URL",
      "GEMINI_API_KEY",
      "HUME_EVI_WS_URL",
      "HUME_API_KEY",
      "AZURE_VOICE_LIVE_WS_URL",
      "AZURE_VOICE_LIVE_API_KEY",
      "QWEN_REALTIME_WS_URL",
      "QWEN_API_KEY",
      "QWEN_MODEL",
      "QWEN_VOICE",
      "MEMORY_DB_PATH",
      "WEBHOOK_PORT",
      "WEBHOOK_SECRET",
    ],
    configFiles: [".env"],
  },
} as const;

/** Claude Code 插件配置 */
export const CLAUDE_CODE_PLUGIN = {
  name: "Voice Hub",
  id: "voice-hub",

  commands: [
    {
      name: "voice.start",
      description: "Start a new voice session",
      handler: "handleVoiceStart",
    },
    {
      name: "voice.stop",
      description: "Stop the current voice session",
      handler: "handleVoiceStop",
    },
    {
      name: "voice.status",
      description: "Get current voice session status",
      handler: "handleVoiceStatus",
    },
    {
      name: "voice.text",
      description: "Send text to be spoken",
      handler: "handleVoiceText",
      params: [
        {
          name: "text",
          description: "The text to speak",
          required: true,
        },
      ],
    },
  ],

  settings: [
    {
      key: "voice.provider",
      title: "Voice Provider",
      description: "Select the voice service provider",
      type: "select",
      options: [
        { value: "disabled", label: "Disabled" },
        { value: "local-mock", label: "Local Mock (Testing)" },
        { value: "volcengine-realtime", label: "Volcengine Realtime" },
        { value: "openai-realtime", label: "OpenAI Realtime" },
        { value: "gemini-live", label: "Gemini Live" },
        { value: "hume-evi", label: "Hume EVI" },
        { value: "azure-voice-live", label: "Azure Voice Live" },
        { value: "qwen-dashscope", label: "Qwen DashScope Realtime" },
      ],
      default: "local-mock",
    },
    {
      key: "voice.autoStart",
      title: "Auto-start Listening",
      description: "Automatically start listening when session is created",
      type: "boolean",
      default: false,
    },
    {
      key: "voice.saveAudio",
      title: "Save Audio Files",
      description: "Save audio recordings to disk",
      type: "boolean",
      default: false,
    },
  ],

  notifications: [
    {
      event: "session.started",
      message: "Voice session started",
      type: "info",
    },
    {
      event: "session.ended",
      message: "Voice session ended",
      type: "info",
    },
    {
      event: "error",
      message: "Voice error occurred",
      type: "error",
    },
  ],
};

/** 安装说明 */
export const INSTALLATION_INSTRUCTIONS = `
# Voice Hub Installation

## Prerequisites

- Node.js >= 22.12.0
- pnpm >= 9.0.0
- Discord Bot Token (for Discord integration)

## Install via Claude Code Marketplace

1. Open Claude Code
2. Go to Settings > Plugins
3. Search for "Voice Hub"
4. Click Install

## Manual Installation

\`\`\`bash
# Install the package
pnpm add @voice-hub/claude-marketplace

# Configure environment variables
cp .env.example .env

# Edit .env with your configuration
vim .env
\`\`\`

## Configuration

Create a \`.env\` file in your project root:

\`\`\`env
# Discord Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_guild_id
DISCORD_VOICE_CHANNEL_ID=your_voice_channel_id

# Voice Provider (disabled, local-mock, local-pipeline, volcengine-realtime, openai-realtime, gemini-live, hume-evi, azure-voice-live, or qwen-dashscope)
VOICE_PROVIDER=local-mock

# Volcengine Configuration (if using volcengine-realtime)
VOLCENGINE_REALTIME_WS_URL=wss://...
VOLCENGINE_APP_ID=your_app_id
VOLCENGINE_ACCESS_TOKEN=your_access_token

# OpenAI Configuration
OPENAI_REALTIME_WS_URL=wss://api.openai.com/v1/realtime
OPENAI_API_KEY=your_openai_api_key

# Gemini Configuration
GEMINI_LIVE_WS_URL=wss://generativelanguage.googleapis.com/ws
GEMINI_API_KEY=your_gemini_api_key

# Hume Configuration
HUME_EVI_WS_URL=wss://api.hume.ai/v0/evi/chat
HUME_API_KEY=your_hume_api_key

# Azure Configuration
AZURE_VOICE_LIVE_WS_URL=wss://your-resource.openai.azure.com/openai/realtime
AZURE_VOICE_LIVE_API_KEY=your_azure_voice_live_key

# Qwen DashScope Configuration (if using qwen-dashscope)
QWEN_REALTIME_WS_URL=wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime
QWEN_API_KEY=your_qwen_api_key
QWEN_MODEL=qwen3-omni-flash-realtime
QWEN_VOICE=Chelsie

# Memory Storage
MEMORY_DB_PATH=~/.voice-hub/voice-hub.db

# Webhook Server
WEBHOOK_PORT=8911
WEBHOOK_SECRET=your_webhook_secret
\`\`\`

## Usage

\`\`\`typescript
import { VoiceHub } from '@voice-hub/claude-marketplace';

const hub = new VoiceHub({
  runtimeUrl: 'http://localhost:8911',
});

// Create a session
const sessionId = await hub.createSession();

// Start listening
await hub.startListening(sessionId);

// ... interaction ...

// Stop and cleanup
await hub.destroySession(sessionId);
\`\`\`
`;

/** 导出所有内容 */
export { MANIFEST as default };
