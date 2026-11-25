declare module 'dignity.js/node' {
  import type { StreamSession } from 'dignity.js';
  import type { InMemoryStreamSignalingBus, SignedMediaChunk, WebRTCDataChannelTransport } from 'dignity.js';

  export const DEFAULT_CHUNK_BYTES: number;

  export interface MediaFrame {
    payloadBytes: Uint8Array;
    mimeType?: string;
    timestampMs?: number;
    layerId?: string;
  }

  export interface NodeMediaIngest {
    kind: 'file' | 'ffmpeg';
    filePath: string;
    chunkBytes: number;
    child?: unknown;
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
    ffmpegPath?: string;
    ffmpegArgs?: string[];
    spawn?: typeof import('child_process').spawn;
  }): NodeMediaIngest;

  export function resolveNodeMediaIngest(options: {
    filePath: string;
    chunkBytes?: number;
    ffmpegPath?: string;
    spawn?: typeof import('child_process').spawn;
    spawnSync?: typeof import('child_process').spawnSync;
  }): Promise<NodeMediaIngest>;

  export class NodeStreamOrigin {
    constructor(options: {
      session: StreamSession;
      signingSecretKey: Uint8Array;
      signingPublicKey: string;
      bus: InMemoryStreamSignalingBus;
      mediaIngest: NodeMediaIngest;
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