import type { NormalizedAudioFrame } from "@voice-hub/shared-types";
import { Resampler } from "./resampler.js";

export interface NormalizeAudioOptions {
  targetSampleRate: number;
  targetChannels: number;
  sequence?: number;
  timestamp?: number;
  source?: NormalizedAudioFrame["source"];
}

export interface ChunkAudioOptions {
  chunkDurationMs: number;
  startSequence?: number;
}

export class AudioFormatNormalizer {
  static normalizeFrame(
    frame: {
      data: Int16Array;
      sampleRate: number;
      channels: number;
      sequence?: number;
      timestamp?: number;
      source?: NormalizedAudioFrame["source"];
    },
    options: NormalizeAudioOptions,
  ): NormalizedAudioFrame {
    const normalized = Resampler.resample(
      {
        data: frame.data,
        sampleRate: frame.sampleRate,
        channels: frame.channels,
        sequence: frame.sequence ?? options.sequence ?? 0,
        timestamp: frame.timestamp ?? options.timestamp ?? Date.now(),
      },
      options.targetSampleRate,
      options.targetChannels,
    );

    return {
      ...normalized,
      encoding: "pcm16",
      littleEndian: true,
      source: frame.source ?? options.source ?? "local",
    };
  }

  static fromBase64Pcm16(
    audioBase64: string,
    sampleRate: number,
    channels: number,
    options: NormalizeAudioOptions,
  ): NormalizedAudioFrame {
    const pcm = this.decodeBase64Pcm16(audioBase64);
    return this.normalizeFrame(
      {
        data: pcm,
        sampleRate,
        channels,
        source: options.source,
        sequence: options.sequence,
        timestamp: options.timestamp,
      },
      options,
    );
  }

  static decodeBase64Pcm16(audioBase64: string): Int16Array {
    const normalized = audioBase64.trim();
    if (
      normalized.length === 0 ||
      normalized.length % 4 !== 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)
    ) {
      throw new Error("Invalid base64 PCM16 payload");
    }

    const buffer = Buffer.from(normalized, "base64");
    if (buffer.byteLength === 0 || buffer.byteLength % 2 !== 0) {
      throw new Error("Invalid PCM16 byte length");
    }

    const pcm = new Int16Array(buffer.byteLength / 2);
    for (let i = 0; i < pcm.length; i++) {
      pcm[i] = buffer.readInt16LE(i * 2);
    }

    return pcm;
  }

  static toBase64Pcm16(data: Int16Array): string {
    const buffer = Buffer.allocUnsafe(data.length * 2);
    for (let i = 0; i < data.length; i++) {
      buffer.writeInt16LE(data[i] ?? 0, i * 2);
    }
    return buffer.toString("base64");
  }

  static chunkFrame(
    frame: NormalizedAudioFrame,
    options: ChunkAudioOptions,
  ): NormalizedAudioFrame[] {
    const samplesPerChannel = Math.max(
      1,
      Math.floor((frame.sampleRate * options.chunkDurationMs) / 1000),
    );
    const samplesPerChunk = samplesPerChannel * frame.channels;
    const chunks: NormalizedAudioFrame[] = [];
    const baseSequence = options.startSequence ?? frame.sequence;

    for (
      let offset = 0, index = 0;
      offset < frame.data.length;
      offset += samplesPerChunk, index++
    ) {
      chunks.push({
        ...frame,
        data: frame.data.slice(
          offset,
          Math.min(offset + samplesPerChunk, frame.data.length),
        ),
        sequence: baseSequence + index,
      });
    }

    return chunks;
  }
}
