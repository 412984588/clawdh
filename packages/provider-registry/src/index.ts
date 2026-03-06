import type { Config } from "@voice-hub/shared-config";
import type {
  CapabilityNegotiationResult,
  ProviderCapabilities,
  ProviderSelectionScope,
  RealtimeVoiceProvider,
} from "@voice-hub/shared-types";
import type { ProviderFactory } from "@voice-hub/provider-contracts";

export interface ProviderRegistration {
  id: string;
  create: ProviderFactory;
  capabilities: ProviderCapabilities;
}

export class ProviderRegistry {
  private readonly providers = new Map<string, ProviderRegistration>();

  register(registration: ProviderRegistration): void {
    this.providers.set(registration.id, registration);
  }

  has(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  create(providerId: string): RealtimeVoiceProvider {
    const registration = this.providers.get(providerId);
    if (!registration) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    return registration.create();
  }

  list(): ProviderRegistration[] {
    return [...this.providers.values()].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
  }

  capabilityMatrix(): Array<{
    providerId: string;
    capabilities: ProviderCapabilities;
  }> {
    return this.list().map((registration) => ({
      providerId: registration.id,
      capabilities: registration.capabilities,
    }));
  }

  negotiate(
    providerId: string,
    requested: Partial<ProviderCapabilities>,
  ): CapabilityNegotiationResult {
    const registration = this.providers.get(providerId);
    if (!registration) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    const fallbacks: string[] = [];
    const unsupported: string[] = [];
    const effective = { ...registration.capabilities };

    for (const [key, requestedValue] of Object.entries(requested)) {
      if (requestedValue === undefined) {
        continue;
      }
      const capabilityValue = effective[key as keyof ProviderCapabilities];
      if (
        typeof requestedValue === "boolean" &&
        requestedValue &&
        capabilityValue === false
      ) {
        unsupported.push(key);
      }
    }

    if (!effective.toolCalling) {
      fallbacks.push("local-tool-intent-extractor");
    }
    if (!effective.textAnnouncement) {
      fallbacks.push("local-announcement-queue");
    }
    if (!effective.transcriptFinal) {
      fallbacks.push("local-transcript-adapter");
    }
    if (!effective.semanticVAD && effective.serverVAD) {
      fallbacks.push("server-vad");
    }

    return {
      providerId,
      requested,
      effective,
      fallbacks,
      unsupported,
    };
  }
}

export class ProviderSelectionPolicy {
  constructor(private readonly config: Config) {}

  select(scope: ProviderSelectionScope & { providerId?: string }): string {
    if (scope.providerId) {
      return scope.providerId;
    }
    if (scope.voiceChannelId) {
      const envKey = `VOICE_PROVIDER_CHANNEL_${scope.voiceChannelId}`;
      const override = process.env[envKey];
      if (override) {
        return override;
      }
    }
    if (scope.guildId) {
      const envKey = `VOICE_PROVIDER_GUILD_${scope.guildId}`;
      const override = process.env[envKey];
      if (override) {
        return override;
      }
    }
    if (scope.discordUserId) {
      const envKey = `VOICE_PROVIDER_USER_${scope.discordUserId}`;
      const override = process.env[envKey];
      if (override) {
        return override;
      }
    }
    return this.config.voiceProvider;
  }
}
