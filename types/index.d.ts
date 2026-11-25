declare module 'dignity.js' {
  export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
  export interface JsonObject {
    [key: string]: JsonValue;
  }

  export type CompatibilityPolicy =
    | 'advisory'
    | 'strict'
    | 'backward-compatible'
    | 'patch-only'
    | 'minor-and-patch';

  export const COMPATIBILITY_POLICIES: readonly CompatibilityPolicy[];
  export const DEFAULT_COMPATIBILITY_POLICY: CompatibilityPolicy;

  export interface SecurityOptions {
    enabled?: boolean;
    signingEnabled?: boolean;
    encryptionEnabled?: boolean;
    powEnabled?: boolean;
    powSteps?: number;
    powTargetMs?: number;
    kdfIterations?: number;
    appPassword?: string;
    broadcastPasswords?: Record<string, string>;
    banDurationMs?: number;
  }

  export const DEFAULT_SECURITY_OPTIONS: Required<Pick<
    SecurityOptions,
    'enabled' | 'signingEnabled' | 'encryptionEnabled' | 'powEnabled' | 'powSteps' | 'powTargetMs' | 'kdfIterations'
  >> & SecurityOptions;

  export const DEFAULT_APP_PASSWORD: string;

  export interface DignityRecord<TData = JsonObject> {
    id: string;
    ownerId: string;
    collaboratorIds?: string[];
    data: TData;
    hash?: string;
    createdAt: number;
    updatedAt: number;
    version: number;
    verificationHash?: string;
    verificationVersion?: string;
  }

  export interface DeletedStub {
    id: string;
    ownerId: string;
    deletedAt: number;
    version: number;
  }

  export interface CrudOptions {
    id?: string;
    collaborators?: string[];
    broadcastScope?: string;
    connectToPeers?: string[];
    peerGroupId?: string;
    expectedVersion?: number;
    keepAsCollaborator?: boolean;
  }

  export interface VerificationOptions {
    code: unknown;
    version?: string;
    policy?: CompatibilityPolicy;
    reflective?: boolean;
    dappId?: string;
  }

  export interface VerificationEntry {
    hash: string;
    version?: string | null;
    policy: CompatibilityPolicy;
    reflective?: boolean;
    fingerprintList?: Array<{ path: string; hash: string }>;
    versionRegistry?: Map<string, string>;
  }

  export interface Proposal {
    proposalId: string;
    collection: string;
    id: string;
    patch: JsonObject;
    proposerId: string;
    ownerId: string;
    signature?: string;
  }

  export interface ConnectionStats {
    openCount: number;
    peerIds: string[];
  }

  export interface PeerGroupStats {
    joinedGroups: string[];
    seenGossipCount: number;
    openConnectionCount: number;
    globalMaxOpenConnections: number;
  }

  export interface DignityP2PConfig {
    nodeId: string;
    networkAdapter: unknown;
    idGenerator?: () => string;
    now?: () => number;
    security?: SecurityOptions;
  }

  export interface DignityP2PEventMap {
    change: { kind: string; collection: string; id: string };
    conflict: JsonObject;
    warning: { type: string; [key: string]: unknown };
    domainevent: JsonObject;
    chainbroken: JsonObject;
    bulkrelaychanged: JsonObject;
    checkpointpublished: JsonObject;
    peerdiscovered: JsonObject;
    peergroupjoined: JsonObject;
    peergroupleft: JsonObject;
    peergroupmessage: JsonObject;
    peerleft: JsonObject;
    peerbanned: JsonObject;
    peerunbanned: JsonObject;
    identityrotated: JsonObject;
    coldrecoveryenrolled: JsonObject;
    message: JsonObject;
    proposal: JsonObject;
    proposalresult: JsonObject;
    verificationmismatch: JsonObject;
    policyrejected: JsonObject;
    securityerror: JsonObject;
    messageignored: JsonObject;
  }

  export class DignityP2P {
    constructor(config: DignityP2PConfig);
    nodeId: string;
    start(): Promise<void>;
    stop(): Promise<void>;
    create<T extends JsonObject = JsonObject>(collection: string, data: T, options?: CrudOptions): Promise<DignityRecord<T>>;
    read<T extends JsonObject = JsonObject>(collection: string, id: string): DignityRecord<T> | null;
    list<T extends JsonObject = JsonObject>(collection: string, options?: { includeDeleted?: boolean }): Array<DignityRecord<T> | DeletedStub>;
    update<T extends JsonObject = JsonObject>(collection: string, id: string, patch: Partial<T>, options?: CrudOptions): Promise<DignityRecord<T>>;
    updateWithRetry<T extends JsonObject = JsonObject>(collection: string, id: string, patchFn: (record: DignityRecord<T>) => Partial<T>, options?: CrudOptions): Promise<DignityRecord<T>>;
    remove(collection: string, id: string, options?: CrudOptions): Promise<void>;
    transferOwnership(collection: string, id: string, newOwnerId: string, options?: CrudOptions): Promise<DignityRecord>;
    proposeUpdate(collection: string, id: string, patch: JsonObject, options?: CrudOptions): Promise<{ proposalId: string }>;
    acceptProposal(proposal: Proposal, options?: CrudOptions): Promise<DignityRecord>;
    rejectProposal(proposal: Proposal, reason?: string): Promise<void>;
    pushRecordSnapshot(collection: string, id: string, options?: CrudOptions): Promise<DignityRecord>;
    restoreRecord(collection: string, record: DignityRecord | DeletedStub, options?: JsonObject): DignityRecord | DeletedStub | null;
    getRecordPeerIds(collection: string, id: string, options?: JsonObject): string[];
    registerVerification(collection: string, options: VerificationOptions): VerificationEntry;
    registerPublisherVerification(publisherId: string, collection: string, options: VerificationOptions): VerificationEntry;
    getVerificationEntry(collection: string): VerificationEntry | null;
    getPublisherVerificationEntry(publisherId: string, collection: string): VerificationEntry | null;
    resolveVerificationEntry(collection: string, senderId?: string | null): VerificationEntry | null;
    connectToPeer(peerId: string): Promise<void>;
    getConnectionStats(): ConnectionStats;
    ensureConnectedToPeers(peerIds?: string[]): Promise<void>;
    joinDiscovery(scope?: string, options?: { bootstrapPeerIds?: string[]; metadata?: JsonObject }): Promise<void>;
    leaveDiscovery(scope?: string): Promise<void>;
    listPeers(scope?: string, options?: { includeSelf?: boolean }): Array<{ peerId: string; metadata?: JsonObject }>;
    announcePresence(scope?: string, metadataOverride?: JsonObject | null): Promise<void>;
    broadcastMessage(messageType: string, payload: unknown, securityContext?: JsonObject): Promise<void>;
    sendDirectMessage(targetId: string, messageType: string, payload: unknown): Promise<void>;
    registerPeerPublicKey(peerId: string, publicKey: unknown, options?: JsonObject): void;
    trustPeerPublicKey(peerId: string, publicKey: unknown): void;
    getPublicKey(): JsonObject;
    banPeer(peerId: string, durationMs?: number, reason?: string): void;
    unbanPeer(peerId: string): void;
    getBanInfo(peerId: string): { expiresAt: number; reason: string } | null;
    getPeerIdentityGeneration(peerId: string): number;
    getPeerIdentityState(peerId: string): JsonObject | null;
    adoptDerivedIdentityKeyPair(keyPair: unknown, options?: { generation?: number }): Promise<void>;
    deriveAndAdoptIdentity(options: { username: string; password: string; generation?: number; pepper?: string; kdfIterations?: number }): Promise<void>;
    broadcastIdentityRotation(rotation: unknown, options?: JsonObject): Promise<void>;
    broadcastColdRecoveryEnrollment(enrollment: unknown, options?: JsonObject): Promise<void>;
    enrollAndBroadcastColdRecovery(options: JsonObject): Promise<unknown>;
    revokeAndRotateDerivedIdentity(options: JsonObject): Promise<JsonObject>;
    rotateDerivedIdentityPassword(options: JsonObject): Promise<JsonObject>;
    applyPeerIdentityRotation(peerId: string, rotation: unknown): boolean;
    applyPeerColdRecoveryEnrollment(peerId: string, enrollment: unknown): boolean;
    joinPeerGroup(groupId: string, options?: JsonObject): Promise<void>;
    leavePeerGroup(groupId: string): Promise<void>;
    listPeerGroupMembers(groupId: string, options?: JsonObject): Array<{ peerId: string; metadata?: JsonObject }>;
    publishToPeerGroup(groupId: string, innerMessageType: string, innerPayload: unknown, options?: JsonObject): Promise<void>;
    publishPeerGroupBulk(groupId: string, innerMessageType: string, innerPayload: unknown, options?: JsonObject): Promise<void>;
    publishPeerGroupCheckpoint(groupId: string, options?: JsonObject): Promise<void>;
    publishRecordToPeerGroup(groupId: string, collection: string, id: string, options?: JsonObject): Promise<void>;
    getPeerGroupConfig(groupId: string): JsonObject | null;
    getPeerGroupStats(): PeerGroupStats;
    on<K extends keyof DignityP2PEventMap>(event: K, listener: (payload: DignityP2PEventMap[K]) => void): this;
    off<K extends keyof DignityP2PEventMap>(event: K, listener: (payload: DignityP2PEventMap[K]) => void): this;
    emit<K extends keyof DignityP2PEventMap>(event: K, payload: DignityP2PEventMap[K]): boolean;
  }

  export class InMemoryNetworkHub {
    constructor();
  }

  export class InMemoryNetworkAdapter {
    constructor(hub: InMemoryNetworkHub);
    start(nodeId: string): Promise<void>;
    stop(): Promise<void>;
    send(targetId: string, message: unknown): Promise<void>;
    broadcast(message: unknown): Promise<void>;
    onMessage(handler: (message: unknown) => void): void;
  }

  export interface PeerJSNetworkAdapterOptions {
    urls?: string[];
    url?: string;
    iceServers?: RTCIceServer[];
    peerOptions?: JsonObject;
    maxOpenConnections?: number;
  }

  export class PeerJSNetworkAdapter {
    constructor(options?: PeerJSNetworkAdapterOptions);
    start(nodeId: string): Promise<void>;
    stop(): Promise<void>;
    connect(peerId: string): Promise<void>;
    send(targetId: string, message: unknown): Promise<void>;
    onMessage(handler: (message: unknown) => void): void;
    getOpenConnectionCount(): number;
    listOpenPeerIds(): string[];
  }

  export function createPeerJSNetworkAdapter(options?: PeerJSNetworkAdapterOptions): PeerJSNetworkAdapter;

  export class IndexedDBPersistence {
    constructor(options?: { dbName?: string; storeName?: string; collections?: string[]; indexedDB?: IDBFactory });
    attach(node: DignityP2P): Promise<void>;
    detach(): Promise<void>;
  }

  export class SignalingPool {
    constructor(providers?: unknown[]);
    start(): Promise<void>;
    stop(): Promise<void>;
  }

  export function createDefaultSignalingPool(options?: JsonObject): SignalingPool;

  export class WebSocketSignalingProvider {
    constructor(options: JsonObject);
  }

  export class PeerJSSignalingProvider {
    constructor(options: JsonObject);
  }

  export const DEFAULT_CLOUDFLARE_SIGNALING_URLS: readonly string[];
  export const DEFAULT_SIGNALING_FALLBACK_URLS: readonly string[];

  export class MessageSecurityService {
    constructor(options?: SecurityOptions);
  }

  export class VDF {
    constructor(options?: JsonObject);
  }

  export class SlothPermutation {
    constructor(options?: JsonObject);
  }

  export function deriveKeyPairFromCredentials(options: JsonObject): Promise<JsonObject>;
  export function deriveColdRecoverySigningKey(options: JsonObject): Promise<Uint8Array>;
  export function keyPairToPublicBundle(keyPair: unknown): JsonObject;
  export function exportIdentityMnemonic(keyPair: unknown): Promise<string>;
  export function importIdentityMnemonic(phrase: string): Promise<JsonObject>;
  export function exportIdentityMnemonicEncrypted(
    keyPair: unknown,
    options: { passphrase: string; kdfIterations?: number }
  ): Promise<string>;
  export function importIdentityMnemonicEncrypted(
    encrypted: string,
    options: { passphrase: string }
  ): Promise<JsonObject>;
  export function normalizeMnemonicPhrase(phrase: string): string[];
  export function createIdentityRotation(options: JsonObject): JsonObject;
  export function verifyIdentityRotation(rotation: unknown, options?: JsonObject): boolean;
  export function revokeAndRotateIdentity(options: JsonObject): Promise<JsonObject>;
  export function rotateIdentityPassword(options: JsonObject): Promise<JsonObject>;
  export function enrollColdRecoveryPassword(options: JsonObject): Promise<JsonObject>;
  export function verifyColdRecoveryEnrollment(enrollment: unknown, options?: JsonObject): boolean;
  export function shouldApplyIdentityRotation(localGeneration: number, remoteGeneration: number): boolean;
  export function parsePeerJsServerUrl(url: string): JsonObject;

  export const PEER_GROUP_SCOPE_PREFIX: string;
  export const DEFAULT_PEER_GROUP_OPTIONS: JsonObject;
  export function peerGroupScope(groupId: string): string;
  export function parsePeerGroupScope(scope: string): string | null;
  export function selectFanoutPeers(peers: string[], count: number, exclude?: string[]): string[];

  export const DOMAIN_EVENT_SCHEMA_VERSION: number;
  export function operationToDomainEvent(operation: JsonObject, options?: JsonObject): JsonObject;
  export function signDomainEvent(event: JsonObject, privateKey: Uint8Array): JsonObject;
  export function verifyDomainEvent(event: JsonObject, publicKey: Uint8Array): boolean;
  export function verifyEventChain(events: JsonObject[]): { ok: boolean; reason?: string };
  export function buildCheckpoint(events: JsonObject[], options?: JsonObject): JsonObject;
  export function createEmptyView(collections?: string[]): JsonObject;
  export function applyDomainEventToView(view: JsonObject, event: JsonObject): JsonObject;

  export const DEFAULT_LIVE_CAP: number;
  export const DEFAULT_BULK_INTERVAL_MS: number;
  export const DEFAULT_BULK_RELAY_COUNT: number;
  export function assignPeerGroupTier(options: JsonObject): string;
  export function filterPeersByTier(peers: JsonObject[], tier: string): JsonObject[];
  export function electBulkRelays(peers: JsonObject[], count?: number): string[];

  export class DignityQueryReplica {
    constructor(options: { dignity: DignityP2P; groupId: string; collections?: string[] });
    start(): Promise<void>;
    stop(): Promise<void>;
    read<T extends JsonObject = JsonObject>(collection: string, id: string): DignityRecord<T> | null;
    list<T extends JsonObject = JsonObject>(collection: string): DignityRecord<T>[];
    verifyChain(): { ok: boolean; reason?: string };
    getViewStats(): JsonObject;
    on(event: string, listener: (...args: unknown[]) => void): this;
    off(event: string, listener: (...args: unknown[]) => void): this;
  }

  export const DIGNITY_APP_MANIFEST_SCHEMA_VERSION: number;
  export function validateDignityAppManifest(raw: unknown): { ok: true; manifest: JsonObject } | { ok: false; reason: string };
  export function collectionAllowed(manifest: JsonObject, collectionName: string): boolean;
  export function getStoredCommand(manifest: JsonObject, commandId: string): JsonObject | null;
  export function buildAppCsp(manifest: JsonObject): string;
  export function prepareSandboxedAppHtml(html: string, manifest: JsonObject): string;
  export function injectCspMeta(html: string, cspContent: string): string;
  export function executeStoredCommand(node: DignityP2P, manifest: JsonObject, commandId: string, payload: JsonObject, options?: JsonObject): Promise<JsonObject>;
  export function isPublisherCommandCapable(node: DignityP2P | null | undefined): boolean;
  export function createHostRpcHandler(options: JsonObject): (method: string, params: JsonObject) => Promise<unknown>;
  export const RPC_METHODS: readonly string[];
  export const DEFAULT_SANDBOX: string;
  export const HANDSHAKE_TYPE: string;

  export class DignityAppHost {
    constructor(options: JsonObject);
    mount(container: HTMLElement, html: string): Promise<void>;
    unmount(): void;
    rpc(method: string, params?: JsonObject): Promise<unknown>;
    on(event: string, listener: (...args: unknown[]) => void): this;
    off(event: string, listener: (...args: unknown[]) => void): this;
  }

  export function createDignityAppClient(port: MessagePort): JsonObject;
  export function connectDignityAppClient(): Promise<JsonObject>;
  export function buildClientBootstrapScript(options?: JsonObject): string;
  export function attachErrorPanel(container: HTMLElement, host: DignityAppHost, options?: JsonObject): JsonObject;
  export function sanitizeCaptureMessage(message: unknown, maxLength?: number): string;
  export function sanitizeCaptureValue(value: unknown, maxDepth?: number): unknown;

  export function hashVerificationCode(code: unknown, options?: { policy?: CompatibilityPolicy; reflective?: boolean }): string;
  export function normalizeVerificationCode(code: unknown): string;
  export function parseSemver(version: string): { major: number; minor: number; patch: number };
  export function compareSemver(a: string, b: string): number;
  export function buildVerificationEntry(options: VerificationOptions): VerificationEntry;
  export function buildPublisherVerificationKey(publisherId: string, collection: string): string;
  export function evaluateVerificationCompatibility(local: VerificationEntry, remote: JsonObject): { accept: boolean; reason?: string };
  export function buildVerificationPresenceMetadata(registry: Map<string, VerificationEntry> | JsonObject): JsonObject;
  export function buildPublisherVerificationPresenceMetadata(registry: Map<string, VerificationEntry> | JsonObject): JsonObject;
  export function hashReflectiveLogic(input: unknown, options?: { policy?: CompatibilityPolicy }): { hash: string; fingerprints: Map<string, string>; fingerprintList: Array<{ path: string; hash: string }> };
  export function normalizeFunctionSource(source: string, options?: JsonObject): string;
  export function collectReflectiveFingerprints(input: unknown, options?: JsonObject): { canonical: unknown; fingerprints: Map<string, string> };

  /** @experimental Live streaming (#152); v1.3.0 adds signed public-mode chunk path over injectable signaling */
  export type StreamAccessMode =
    | 'private-single'
    | 'private-list'
    | 'public'
    | 'combined';

  export const STREAM_ACCESS_MODES: Readonly<{
    PRIVATE_SINGLE: 'private-single';
    PRIVATE_LIST: 'private-list';
    PUBLIC: 'public';
    COMBINED: 'combined';
  }>;

  export const STREAMING_API_EXPERIMENTAL: true;

  export interface StreamSessionOptions {
    sessionId: string;
    broadcasterId: string;
    mode: StreamAccessMode;
    privateRecipients?: string[];
    metadata?: JsonObject;
  }

  export class StreamSession {
    constructor(options: StreamSessionOptions);
    readonly sessionId: string;
    readonly broadcasterId: string;
    readonly mode: StreamAccessMode;
    readonly privateRecipients: readonly string[];
    readonly metadata: JsonObject;
    canJoin(identityId: string): boolean;
    canDecryptPrivateTracks(identityId: string): boolean;
    toJSON(): JsonObject;
  }

  export function normalizePrivateRecipients(recipients: unknown): string[];
  export function validateStreamAccessConfig(mode: StreamAccessMode, config?: { privateRecipients?: string[] }): string[];
  export function createStreamSession(options: StreamSessionOptions): StreamSession;
  export function canJoinStream(session: StreamSession, identityId: string): boolean;

  export const MEDIA_CHUNK_VERSION: number;
  export const STREAM_MESSAGE_TYPES: Readonly<{
    JOIN_OFFER: string;
    JOIN_REQUEST: string;
    JOIN_ACCEPT: string;
    JOIN_REJECT: string;
    MEDIA_CHUNK: string;
  }>;

  export interface MediaChunkRendition {
    profile: string;
    width: number;
    height: number;
    videoBitrateKbps: number;
    audioBitrateKbps: number;
  }

  export interface SignedMediaChunk {
    version: number;
    sessionId: string;
    broadcasterId: string;
    sequence: number;
    timestampMs: number;
    layerId: string;
    mimeType: string;
    payloadBase64: string;
    payloadFingerprint: string;
    signatureBase64: string;
    signingPublicKey: string;
    keyframe?: boolean;
    rendition?: MediaChunkRendition;
  }

  export const MEDIA_CHUNK_VERSION_KEYFRAME: number;
  export const RENDITION_PROFILE_HD720: 'hd720';
  export const RENDITION_PROFILE_FHD1080: 'fhd1080';

  export function resolveRendition(
    profile: 'hd720' | 'fhd1080',
    layerId: 'L0' | 'L1' | 'L2'
  ): MediaChunkRendition & { layerId: string };

  export interface ReceiverReport {
    sessionId: string;
    viewerId: string;
    layerId: string;
    timestampMs: number;
    intervalMs: number;
    bytesReceived: number;
    packetsReceived: number;
    packetsLost: number;
    interarrivalDelayMs: number;
  }

  export function createReceiverReport(fields: {
    sessionId: string;
    viewerId: string;
    layerId: string;
    timestampMs: number;
    intervalMs: number;
    bytesReceived: number;
    packetsReceived: number;
    packetsLost: number;
    interarrivalDelayMs: number;
  }): ReceiverReport;

  export function createBandwidthEstimator(options: {
    floorBps: number;
    ceilingBps: number;
    quietGainBps?: number;
    initialEstimateBps?: number;
  }): {
    observe(report: ReceiverReport): number;
    getEstimateBps(): number;
  };

  export function createLayerSelector(options: {
    profile: 'hd720' | 'fhd1080';
    headroomFactor?: number;
    downgradeHoldMs?: number;
    upgradeHoldMs?: number;
    initialLayerId?: 'L0' | 'L1' | 'L2';
    waitForKeyframeOnUpgrade?: boolean;
  }): {
    selectLayer(input: {
      estimateBps: number;
      nowMs: number;
      keyframeByLayer?: Partial<Record<'L0' | 'L1' | 'L2', boolean>>;
    }): string;
    getLayerId(): string;
    highestAffordableLayer(estimateBps: number): string;
  };

  export function createPlayoutBuffer(options?: {
    initialTargetDelayMs?: number;
    maxTargetDelayMs?: number;
    raiseStepMs?: number;
  }): {
    observeReport(report: ReceiverReport): number;
    mayStepDownLayer(): boolean;
    notifyLayerStepDown(): void;
    getTargetDelayMs(): number;
    push(chunk: SignedMediaChunk | object): void;
    drainReady(playoutNowMs: number): object[];
    selectLayerWithBufferGuard(
      selector: ReturnType<typeof createLayerSelector>,
      input: { estimateBps: number; nowMs: number; keyframeByLayer?: Partial<Record<'L0' | 'L1' | 'L2', boolean>> }
    ): string;
  };

  export interface NormalizedSimulcastLayer {
    layerId: string;
    payloadBytes: Uint8Array;
    keyframe: boolean;
  }

  export function normalizeSimulcastLayers(
    frameOrLayers:
      | NormalizedSimulcastLayer[]
      | {
          layers:
            | Array<{ layerId: string; payloadBytes?: Uint8Array; data?: Uint8Array; keyframe?: boolean }>
            | Record<string, { payloadBytes?: Uint8Array; data?: Uint8Array; keyframe?: boolean }>;
        }
  ): NormalizedSimulcastLayer[];

  export function createLayerSequenceTracker(): {
    next(layerId?: string): number;
    peek(layerId?: string): number;
    snapshot(): Map<string, number>;
  };

  export function runSimulcastLoadTrace(options: {
    bus: InMemoryStreamSignalingBus;
    broadcaster: PublicStreamBroadcaster;
    relay: PublicStreamRelay;
    viewerHealthy: PublicStreamViewer;
    viewerDegraded: PublicStreamViewer;
    viewerSelectorDegraded: ReturnType<typeof createLayerSelector>;
    playoutDegraded?: ReturnType<typeof createPlayoutBuffer>;
    estimatorDegraded: ReturnType<typeof createBandwidthEstimator>;
    degradedChildId: string;
    healthyChildId: string;
    sessionId: string;
    l0Bps: number;
    l1Bps: number;
    l2Bps: number;
    payloadForLayer?: (layerId: string) => Uint8Array;
  }): {
    publishedLayerIds: string[];
    relayLayerHealthy: string;
    relayLayerDegraded: string;
    viewerLayerDegraded: string;
    logLines: string[];
  };

  export const DEFAULT_SCALE_SIM_SEED: number;

  export function runScaleSimulation(options?: {
    seed?: number;
    profile?: 'ci' | 'offline';
  }): {
    seed: number;
    profile: 'ci' | 'offline';
    targets: Array<{ viewers: number; degree: number; hops: number; interiorRelays: number }>;
    interiorRelays: number;
    repair: {
      assumptions: Record<string, unknown>;
      series: Array<{
        depth: number;
        repairMs: number;
        withinSiblingOverlapBudget: boolean;
        pathBreakProbability: number;
      }>;
    };
    stall: {
      relaySampleSize: number;
      forwardChecks: number;
      stalls: number;
      stallRate: number;
      peersConstructed: number;
    };
    origin: {
      capBps: number;
      simulcastStackBps: number;
      degree: number;
      requiredBps: number;
      covers: boolean;
    };
    chunk: {
      verified: boolean;
      tamperedVerified: boolean;
      forwardedByteLength: number;
    };
    claim: { status: 'topology' | 'qualified'; failedChecks?: string[] };
  };

  export function createRelayLayerPolicy(options: {
    profile?: 'hd720' | 'fhd1080';
    headroomFactor?: number;
    floorBps: number;
    ceilingBps: number;
    quietGainBps?: number;
    initialEstimateBps?: number;
    downgradeHoldMs?: number;
    upgradeHoldMs?: number;
    initialLayerId?: 'L0' | 'L1' | 'L2';
  }): {
    registerChild(
      childId: string,
      childOptions?: {
        floorBps?: number;
        ceilingBps?: number;
        quietGainBps?: number;
        initialEstimateBps?: number;
        initialLayerId?: 'L0' | 'L1' | 'L2';
      }
    ): string;
    observeChildReport(
      childId: string,
      report: ReceiverReport
    ): { estimateBps: number; layerId: string };
    getChildLayer(childId: string): string | null;
    shouldForwardToChild(childId: string, chunk: SignedMediaChunk | object): boolean;
    chunkLayerId(chunk: object): 'L0' | 'L1' | 'L2';
  };

  export function createSignedMediaChunk(options: {
    sessionId: string;
    broadcasterId: string;
    payloadBytes: Uint8Array;
    signingSecretKey: Uint8Array;
    signingPublicKey: string;
    sequence?: number;
    timestampMs?: number;
    layerId?: string;
    mimeType?: string;
    keyframe?: boolean;
    profile?: 'hd720' | 'fhd1080';
    rendition?: MediaChunkRendition & { layerId: string };
    chunkVersion?: number;
  }): SignedMediaChunk;

  export interface ParsedMediaFrame {
    payloadBytes: Uint8Array;
    mimeType: string;
    timestampMs: number;
    keyframe: boolean;
  }

  export function parseAnnexBAccessUnits(
    bytes: Uint8Array,
    options?: { frameDurationMs?: number }
  ): ParsedMediaFrame[];

  export function parseFmp4Fragments(bytes: Uint8Array): ParsedMediaFrame[];

  export function demuxMpegTs(bytes: Uint8Array): ParsedMediaFrame[];

  export function verifyMediaChunk(chunk: SignedMediaChunk, expectedSessionId?: string): boolean;
  export function decodeMediaChunkPayload(chunk: SignedMediaChunk): Uint8Array;

  export interface PrivateSenderKeyWrap {
    recipientSigningPublicKey: string;
    wrapNonceBase64: string;
    wrappedSenderKeyBase64: string;
    senderEncryptionPublicKey: string;
  }

  export interface PrivateSignedMediaChunk extends SignedMediaChunk {
    accessMode?: 'private-single' | 'private-list' | 'combined';
    secretboxNonceBase64?: string;
    senderKeyEpoch?: number;
    senderKeyWraps?: PrivateSenderKeyWrap[];
  }

  export interface PrivateSenderKeyEpoch {
    epoch: number;
    senderKey: Uint8Array;
    senderKeyWraps: PrivateSenderKeyWrap[];
    recipientSigningPublicKeys: string[];
  }

  export function createPrivateSenderKeyEpoch(options: {
    recipientPublicBundles: Array<{ signingPublicKey: string; encryptionPublicKey: string }>;
    broadcasterEncryptionSecretKey: Uint8Array;
    broadcasterEncryptionPublicKey: string;
    epoch?: number;
  }): PrivateSenderKeyEpoch;

  export function rotatePrivateSenderKeyEpoch(
    currentEpoch: PrivateSenderKeyEpoch,
    options: {
      removeRecipientSigningPublicKey: string;
      recipientPublicBundles: Array<{ signingPublicKey: string; encryptionPublicKey: string }>;
      broadcasterEncryptionSecretKey: Uint8Array;
      broadcasterEncryptionPublicKey: string;
    }
  ): PrivateSenderKeyEpoch;

  export function sealPrivateMediaChunk(options: {
    accessMode: 'private-single' | 'private-list' | 'combined';
    sessionId: string;
    broadcasterId: string;
    plaintextBytes: Uint8Array;
    signingSecretKey: Uint8Array;
    signingPublicKey: string;
    broadcasterEncryptionSecretKey: Uint8Array;
    broadcasterEncryptionPublicKey: string;
    recipientPublicBundles: Array<{ signingPublicKey: string; encryptionPublicKey: string }>;
    privateSenderKeyEpoch?: PrivateSenderKeyEpoch;
    sequence?: number;
    timestampMs?: number;
    layerId?: string;
    mimeType?: string;
    keyframe?: boolean;
    profile?: 'hd720' | 'fhd1080';
    rendition?: MediaChunkRendition & { layerId: string };
    chunkVersion?: number;
  }): PrivateSignedMediaChunk;

  export function openPrivateMediaChunk(
    chunk: PrivateSignedMediaChunk,
    options: {
      recipientEncryptionSecretKey: Uint8Array;
      recipientSigningPublicKey: string;
      verify?: boolean;
    }
  ): Uint8Array;

  export class InMemoryStreamSignalingBus {
    subscribe(peerId: string, handler: (message: JsonObject) => void): void;
    send(fromPeerId: string, toPeerId: string, message: JsonObject): void;
    fanout(fromPeerId: string, peerIds: string[], message: JsonObject): void;
  }

  export function createInMemoryStreamSignalingBus(): InMemoryStreamSignalingBus;

  export class WebRTCStreamSignalingBus {
    constructor(networkAdapter: PeerJSNetworkAdapter, localPeerId: string);
    subscribe(peerId: string, handler: (message: JsonObject) => void): void;
    send(fromPeerId: string, toPeerId: string, message: JsonObject): Promise<void>;
    fanout(fromPeerId: string, peerIds: string[], message: JsonObject): Promise<void>;
    destroy(): void;
  }

  export function createWebRTCStreamSignalingBus(networkAdapter: PeerJSNetworkAdapter, localPeerId: string): WebRTCStreamSignalingBus;

  export class WebRTCDataChannelTransport {
    constructor(networkAdapter: PeerJSNetworkAdapter);
    onChunk(handler: (senderId: string, chunk: SignedMediaChunk) => void): () => void;
    sendChunk(toPeerIds: string[], chunk: SignedMediaChunk): Promise<void>;
    destroy(): void;
  }

  export function createWebRTCDataChannelTransport(networkAdapter: PeerJSNetworkAdapter): WebRTCDataChannelTransport;

  export class PublicStreamBroadcaster {
    constructor(options: {
      session: StreamSession;
      signingSecretKey: Uint8Array;
      signingPublicKey: string;
      bus: InMemoryStreamSignalingBus;
      directViewerIds?: string[];
    });
    readonly session: StreamSession;
    announce(): void;
    publishChunk(
      payloadBytes: Uint8Array,
      chunkMeta?: {
        timestampMs?: number;
        layerId?: string;
        mimeType?: string;
        keyframe?: boolean;
        profile?: 'hd720' | 'fhd1080';
        rendition?: MediaChunkRendition & { layerId: string };
        chunkVersion?: number;
        sequence?: number;
      }
    ): SignedMediaChunk;
    publishSimulcastTick(
      layers:
        | Array<{ layerId: string; payloadBytes?: Uint8Array; data?: Uint8Array; keyframe?: boolean }>
        | { layers: Array<{ layerId: string; payloadBytes?: Uint8Array; data?: Uint8Array; keyframe?: boolean }> | Record<string, { payloadBytes?: Uint8Array; data?: Uint8Array; keyframe?: boolean }> },
      tickMeta?: {
        timestampMs?: number;
        mimeType?: string;
        profile?: 'hd720' | 'fhd1080';
        rendition?: MediaChunkRendition & { layerId: string };
        chunkVersion?: number;
      }
    ): SignedMediaChunk[];
    getLayerSequence(layerId?: string): number;
    close(): void;
  }

  export class PublicStreamViewer {
    constructor(options: {
      viewerId: string;
      sessionId: string;
      broadcasterId: string;
      broadcasterSigningPublicKey: string;
      bus: InMemoryStreamSignalingBus;
    });
    readonly chunks: SignedMediaChunk[];
    readonly joined: boolean;
    requestJoin(): void;
  }

  export class PublicStreamRelay {
    constructor(options: {
      relayId: string;
      upstreamId: string;
      sessionId: string;
      broadcasterSigningPublicKey: string;
      broadcasterId: string;
      bus: InMemoryStreamSignalingBus;
      downstreamViewerIds: string[];
    });
  }

  export function createPublicStreamBroadcaster(options: {
    sessionId: string;
    broadcasterId: string;
    signingSecretKey: Uint8Array;
    signingPublicKey: string;
    bus: InMemoryStreamSignalingBus;
    initialViewerIds?: string[];
  }): PublicStreamBroadcaster;

  export function createPublicStreamViewer(options: {
    viewerId: string;
    sessionId: string;
    broadcasterId: string;
    broadcasterSigningPublicKey: string;
    bus: InMemoryStreamSignalingBus;
  }): PublicStreamViewer;

  export function isDignityDebugEnabled(): boolean;

  export function setDignityDebugEnabled(enabled: boolean): boolean;

  export function createPublicStreamRelay(options: {
    relayId: string;
    upstreamId: string;
    sessionId: string;
    broadcasterSigningPublicKey: string;
    broadcasterId: string;
    bus: InMemoryStreamSignalingBus;
    downstreamViewerIds: string[];
  }): PublicStreamRelay;

  const dignity: {
    DignityP2P: typeof DignityP2P;
    [key: string]: unknown;
  };

  export default dignity;
}
