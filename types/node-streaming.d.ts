declare module 'dignity.js/node' {
  import type { StreamSession } from 'dignity.js';
  import type { InMemoryStreamSignalingBus, SignedMediaChunk, WebRTCDataChannelTransport } from 'dignity.js';

  export const DEFAULT_CHUNK_BYTES: number;
  export const INGEST_FFMPEG_NOT_FOUND: string;

  export interface SimulcastLayerFrame {
    layerId: string;
    payloadBytes?: Uint8Array;
    data?: Uint8Array;
    keyframe?: boolean;
  }

  export interface MediaFrame {
    payloadBytes?: Uint8Array;
    mimeType?: string;
    timestampMs?: number;
    layerId?: string;
    keyframe?: boolean;
    profile?: 'hd720' | 'fhd1080';
    rendition?: import('dignity.js').MediaChunkRendition & { layerId: string };
    chunkVersion?: number;
    layers?:
      | SimulcastLayerFrame[]
      | Record<string, { payloadBytes?: Uint8Array; data?: Uint8Array; keyframe?: boolean }>;
  }

  export interface NodeMediaIngest {
    kind: 'file' | 'ffmpeg';
    filePath: string;
    chunkBytes: number;
    child?: unknown;
    stop(): void;
    frames(): AsyncIterableIterator<MediaFrame>;
  }

  export interface NodeIngestAdapter {
    kind: string;
    stop(): void;
    frames(): AsyncIterableIterator<MediaFrame>;
  }

  export interface RecipientPublicBundle {
    signingPublicKey: string;
    encryptionPublicKey: string;
  }

  export function isFfmpegAvailable(ffmpegPath?: string, spawnSync?: typeof import('child_process').spawnSync): boolean;

  export function createFileMediaIngest(options: {
    filePath: string;
    chunkBytes?: number;
  }): NodeMediaIngest;

  export function createFfmpegMediaIngest(options: {
    filePath: string;
    chunkBytes?: number;
    format?: 'fmp4' | 'annexb';
    frameDurationMs?: number;
    ffmpegPath?: string;
    ffmpegArgs?: string[];
    spawn?: typeof import('child_process').spawn;
  }): NodeMediaIngest;

  export function resolveNodeMediaIngest(options: {
    filePath: string;
    chunkBytes?: number;
    format?: 'fmp4' | 'annexb';
    frameDurationMs?: number;
    ffmpegPath?: string;
    spawn?: typeof import('child_process').spawn;
    spawnSync?: typeof import('child_process').spawnSync;
  }): Promise<NodeMediaIngest>;

  export function createMpegTsIngest(options: {
    input: string | NodeJS.ReadableStream | { type: 'udp'; port: number; address?: string };
  }): NodeIngestAdapter;

  export function createHlsIngest(options: {
    playlistUrl: string;
    fetch?: typeof fetch;
    pollIntervalMs?: number;
  }): NodeIngestAdapter;

  export function createRtmpIngest(options: {
    url: string;
    ffmpegPath?: string;
    spawn?: typeof import('child_process').spawn;
  }): NodeIngestAdapter;

  export function createSrtIngest(options: {
    url: string;
    ffmpegPath?: string;
    spawn?: typeof import('child_process').spawn;
  }): NodeIngestAdapter;

  export interface WhipPeerFactoryResult {
    answerSdp: string;
    onFrame?: (callback: (frame: MediaFrame) => void) => void;
    close?: () => void;
  }

  export function createWhipIngest(options: {
    peerFactory: (offerSdp: string, ctx: { resourceId: string }) => Promise<WhipPeerFactoryResult>;
    authorize?: (req: import('http').IncomingMessage) => boolean | Promise<boolean>;
    mountPath?: string;
  }): NodeIngestAdapter & {
    mountPath: string;
    sessions: Map<string, unknown>;
    handleRequest(req: import('http').IncomingMessage, res: import('http').ServerResponse): Promise<void>;
  };

  export class NodeStreamOrigin {
    constructor(options: {
      session: StreamSession;
      signingSecretKey: Uint8Array;
      signingPublicKey: string;
      bus: InMemoryStreamSignalingBus;
      mediaIngest?: NodeMediaIngest;
      ingest?: NodeIngestAdapter;
      dataChannelTransport?: WebRTCDataChannelTransport;
      dataChannelPeerIds?: string[];
      directViewerIds?: string[];
      broadcasterEncryptionSecretKey?: Uint8Array;
      broadcasterEncryptionPublicKey?: string;
      recipientPublicBundles?: RecipientPublicBundle[];
    });
    start(): Promise<void>;
    stop(): void;
    rotateRecipients(removeRecipientSigningPublicKey: string): void;
  }

  export function createNodeStreamOrigin(
    options: ConstructorParameters<typeof NodeStreamOrigin>[0]
  ): NodeStreamOrigin;
}