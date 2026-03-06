/**
 * @voice-hub/app
 *
 * Voice Hub 主应用入口
 */

import {
  loadConfig,
  validateConfigForProvider,
} from "@voice-hub/shared-config";
import { DatabaseManager, MemoryStore } from "@voice-hub/memory-bank";
import { Dispatcher } from "@voice-hub/backend-dispatcher";
import { VoiceRuntime } from "@voice-hub/core-runtime";
import { ProviderRegistry } from "@voice-hub/provider-registry";
import { createLocalMockProvider } from "@voice-hub/provider-local-mock";
import { createLocalPipelineProvider } from "@voice-hub/provider-local-pipeline";
import { createOpenAIRealtimeProvider } from "@voice-hub/provider-openai-realtime";
import { createGeminiLiveProvider } from "@voice-hub/provider-gemini-live";
import { createHumeEviProvider } from "@voice-hub/provider-hume-evi";
import { createAzureVoiceLiveProvider } from "@voice-hub/provider-azure-voice-live";
import { createVolcengineRealtimeProvider } from "@voice-hub/provider-volcengine-realtime";
import { VoiceHubServer } from "./server.js";
import { DiscordBot } from "./discord-bot.js";

/** Voice Hub 应用类 */
export class VoiceHubApp {
  private config = loadConfig();
  private database: DatabaseManager;
  private memoryStore: MemoryStore;
  private dispatcher: Dispatcher | null = null;
  private runtime: VoiceRuntime | null = null;
  private discordBot: DiscordBot | null = null;
  private server: VoiceHubServer | null = null;
  private isRunning = false;

  constructor() {
    // 验证配置
    const validation = validateConfigForProvider(this.config);
    if (!validation.valid) {
      throw new Error(`Configuration error:\n${validation.errors.join("\n")}`);
    }

    // 初始化数据库
    this.database = new DatabaseManager({
      dbPath: this.config.memoryDbPath,
      walEnabled: this.config.memoryWalEnabled,
      busyTimeout: this.config.memoryBusyTimeout,
      foreignKeys: true,
    });
    this.database.init();

    // 初始化记忆存储
    this.memoryStore = new MemoryStore(this.database);

    // 初始化后端分发器
    if (this.config.backendDispatchUrl) {
      this.dispatcher = new Dispatcher({
        url: this.config.backendDispatchUrl,
        timeoutMs: this.config.backendTimeoutMs,
        maxRetries: this.config.backendMaxRetries,
        retryDelayMs: 1000,
        secret: this.config.webhookSecret,
        exponentialBackoff: true,
      });
    }

    // 创建 provider registry
    const providerRegistry = new ProviderRegistry();
    const localMock = createLocalMockProvider();
    const localPipeline = createLocalPipelineProvider();
    providerRegistry.register({
      id: localMock.id,
      create: () => createLocalMockProvider(),
      capabilities: localMock.getCapabilities(),
    });
    providerRegistry.register({
      id: localPipeline.id,
      create: () => createLocalPipelineProvider(),
      capabilities: localPipeline.getCapabilities(),
    });

    if (this.config.openaiRealtimeWsUrl && this.config.openaiApiKey) {
      const openai = createOpenAIRealtimeProvider({
        url: this.config.openaiRealtimeWsUrl,
        apiKey: this.config.openaiApiKey,
        model: this.config.openaiRealtimeModel,
      });
      providerRegistry.register({
        id: openai.id,
        create: () =>
          createOpenAIRealtimeProvider({
            url: this.config.openaiRealtimeWsUrl!,
            apiKey: this.config.openaiApiKey!,
            model: this.config.openaiRealtimeModel,
          }),
        capabilities: openai.getCapabilities(),
      });
    }

    if (this.config.geminiLiveWsUrl && this.config.geminiApiKey) {
      const gemini = createGeminiLiveProvider({
        url: this.config.geminiLiveWsUrl,
        apiKey: this.config.geminiApiKey,
        model: this.config.geminiLiveModel,
      });
      providerRegistry.register({
        id: gemini.id,
        create: () =>
          createGeminiLiveProvider({
            url: this.config.geminiLiveWsUrl!,
            apiKey: this.config.geminiApiKey!,
            model: this.config.geminiLiveModel,
          }),
        capabilities: gemini.getCapabilities(),
      });
    }

    if (this.config.humeEviWsUrl && this.config.humeApiKey) {
      const hume = createHumeEviProvider({
        url: this.config.humeEviWsUrl,
        apiKey: this.config.humeApiKey,
        configId: this.config.humeConfigId,
      });
      providerRegistry.register({
        id: hume.id,
        create: () =>
          createHumeEviProvider({
            url: this.config.humeEviWsUrl!,
            apiKey: this.config.humeApiKey!,
            configId: this.config.humeConfigId,
          }),
        capabilities: hume.getCapabilities(),
      });
    }

    if (this.config.azureVoiceLiveWsUrl && this.config.azureVoiceLiveApiKey) {
      const azure = createAzureVoiceLiveProvider({
        url: this.config.azureVoiceLiveWsUrl,
        apiKey: this.config.azureVoiceLiveApiKey,
        deployment: this.config.azureVoiceLiveDeployment,
      });
      providerRegistry.register({
        id: azure.id,
        create: () =>
          createAzureVoiceLiveProvider({
            url: this.config.azureVoiceLiveWsUrl!,
            apiKey: this.config.azureVoiceLiveApiKey!,
            deployment: this.config.azureVoiceLiveDeployment,
          }),
        capabilities: azure.getCapabilities(),
      });
    }

    if (
      this.config.volcengineRealtimeWsUrl &&
      this.config.volcengineAppId &&
      this.config.volcengineAccessToken
    ) {
      const volcengine = createVolcengineRealtimeProvider({
        url: this.config.volcengineRealtimeWsUrl,
        appId: this.config.volcengineAppId,
        accessToken: this.config.volcengineAccessToken,
      });
      providerRegistry.register({
        id: volcengine.id,
        create: () =>
          createVolcengineRealtimeProvider({
            url: this.config.volcengineRealtimeWsUrl!,
            appId: this.config.volcengineAppId!,
            accessToken: this.config.volcengineAccessToken!,
          }),
        capabilities: volcengine.getCapabilities(),
      });
    }

    // 创建运行时
    this.runtime = new VoiceRuntime({
      config: this.config,
      providerRegistry,
      memoryStore: this.memoryStore,
      dispatcher: this.dispatcher || undefined,
    });

    // 创建 Discord Bot
    this.discordBot = new DiscordBot(this.config, this.runtime);

    // 创建 Web 服务器
    this.server = new VoiceHubServer(
      this.config,
      this.runtime,
      this.memoryStore,
    );
  }

  /** 启动应用 */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Voice Hub is already running");
    }

    this.logInfo("Starting Voice Hub...");
    let runtimeStarted = false;
    let discordStarted = false;
    let serverStarted = false;

    try {
      // 启动运行时
      if (this.runtime) {
        await this.runtime.start();
        runtimeStarted = true;
      }

      // 启动 Discord Bot
      if (this.discordBot) {
        await this.discordBot.start();
        discordStarted = true;
        this.logInfo("Discord bot connected");
      }

      // 启动 Web 服务器
      if (this.server) {
        await this.server.start();
        serverStarted = true;
        this.logInfo(`Web server listening on port ${this.config.webhookPort}`);
      }

      this.isRunning = true;
      this.logInfo("Voice Hub is running");
    } catch (error) {
      // 启动失败时回滚已经启动的组件
      if (serverStarted && this.server) {
        await this.stopSafely(() => this.server!.stop(), "web server");
      }

      if (discordStarted && this.discordBot) {
        await this.stopSafely(() => this.discordBot!.stop(), "discord bot");
      }

      if (runtimeStarted && this.runtime) {
        await this.stopSafely(() => this.runtime!.stop(), "runtime");
      }

      this.isRunning = false;
      throw error;
    }
  }

  /** 停止应用 */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logInfo("Stopping Voice Hub...");

    // 停止 Web 服务器
    if (this.server) {
      await this.server.stop();
    }

    // 停止 Discord Bot
    if (this.discordBot) {
      await this.discordBot.stop();
    }

    // 停止运行时
    if (this.runtime) {
      await this.runtime.stop();
    }

    // 关闭数据库
    this.database.close();

    this.isRunning = false;
    this.logInfo("Voice Hub stopped");
  }

  /** 获取运行状态 */
  getStatus(): {
    running: boolean;
    uptime: number;
    activeSessions: number;
  } {
    return {
      running: this.isRunning,
      uptime: this.isRunning ? process.uptime() : 0,
      activeSessions: this.runtime?.getActiveSessionCount() || 0,
    };
  }

  private logInfo(message: string): void {
    process.stdout.write(`[voice-hub-app] ${message}\n`);
  }

  private async stopSafely(
    stopFn: () => Promise<void>,
    component: string,
  ): Promise<void> {
    try {
      await stopFn();
    } catch (error) {
      const detail =
        error instanceof Error ? (error.stack ?? error.message) : String(error);
      process.stderr.write(
        `[voice-hub-app] Failed to rollback ${component}: ${detail}\n`,
      );
    }
  }
}
