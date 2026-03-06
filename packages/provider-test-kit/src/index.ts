import { expect } from "vitest";
import type { RealtimeVoiceProvider } from "@voice-hub/shared-types";

export function assertProviderConformance(
  provider: RealtimeVoiceProvider,
): void {
  expect(provider.id.length).toBeGreaterThan(0);
  const capabilities = provider.getCapabilities();
  expect(capabilities.providerStates.length).toBeGreaterThan(0);
  expect(capabilities.inputAudioFormats.length).toBeGreaterThan(0);
  expect(capabilities.outputAudioFormats.length).toBeGreaterThan(0);
}
