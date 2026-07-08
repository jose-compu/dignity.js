declare module 'dignity.js/react' {
  import type { DignityP2P, DignityP2PConfig, DignityRecord, JsonObject } from 'dignity.js';

  export interface UseDignityResult {
    node: DignityP2P | null;
    status: 'idle' | 'starting' | 'running' | 'error' | 'stopped';
    error: Error | null;
  }

  export interface UseDiscoveryResult {
    joined: boolean;
    error: Error | null;
  }

  export interface UseConnectionStatsResult {
    openCount: number;
    peerIds: string[];
  }

  export interface UseRoomResult extends UseDiscoveryResult {
    peers: Array<{ peerId: string; metadata?: JsonObject }>;
    connectionStats: UseConnectionStatsResult;
  }

  export function useDignity(config: DignityP2PConfig | null | undefined): UseDignityResult;
  export function useCollection<T extends JsonObject = JsonObject>(node: DignityP2P | null, collectionName: string | null | undefined): Array<DignityRecord<T>>;
  export function usePeers(node: DignityP2P | null, scope?: string, options?: { includeSelf?: boolean }): Array<{ peerId: string; metadata?: JsonObject }>;
  export function useObject<T extends JsonObject = JsonObject>(node: DignityP2P | null, collectionName: string | null | undefined, objectId: string | null | undefined): DignityRecord<T> | null;
  export function useDiscovery(node: DignityP2P | null, scope?: string, options?: JsonObject | null): UseDiscoveryResult;
  export function useConnectionStats(node: DignityP2P | null, pollIntervalMs?: number): UseConnectionStatsResult;
  export function useRoom(node: DignityP2P | null, scope?: string, options?: JsonObject | null): UseRoomResult;
  export function useMessages(node: DignityP2P | null, filter?: ((message: JsonObject) => boolean) | null): JsonObject[];
}
