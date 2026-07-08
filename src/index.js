/**
 * dignity.js public API.
 *
 * This package exposes:
 * - `DignityP2P`: REST-like object CRUD over peer-to-peer operation replication
 * - signaling providers and pool helpers
 * - in-memory adapter utilities for tests and local prototyping
 */
const DignityP2P = require('./core/dignity-p2p');
const createDefaultSignalingPool = require('./signaling/create-default-signaling-pool');
const SignalingPool = require('./signaling/signaling-pool');
const WebSocketSignalingProvider = require('./signaling/websocket-signaling-provider');
const PeerJSSignalingProvider = require('./signaling/peerjs-signaling-provider');
const {
  InMemoryNetworkHub,
  InMemoryNetworkAdapter
} = require('./network/in-memory-network');
const {
  PeerJSNetworkAdapter,
  createPeerJSNetworkAdapter
} = require('./network/peerjs-network');
const IndexedDBPersistence = require('./persistence/indexeddb-persistence');
const {
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS
} = require('./signaling/default-signaling-config');
const VDF = require('./security/vdf');
const SlothPermutation = require('./security/sloth-vdf');
const {
  MessageSecurityService,
  DEFAULT_SECURITY_OPTIONS,
  DEFAULT_APP_PASSWORD
} = require('./security/message-security-service');
const { deriveKeyPairFromCredentials, keyPairToPublicBundle, deriveColdRecoverySigningKey } = require('./security/derive-key-pair');
const {
  createIdentityRotation,
  verifyIdentityRotation,
  revokeAndRotateIdentity,
  rotateIdentityPassword,
  enrollColdRecoveryPassword,
  verifyColdRecoveryEnrollment,
  shouldApplyIdentityRotation
} = require('./security/identity-rotation');
const parsePeerJsServerUrl = require('./signaling/parse-peerjs-url');
const {
  PEER_GROUP_SCOPE_PREFIX,
  DEFAULT_PEER_GROUP_OPTIONS,
  peerGroupScope,
  parsePeerGroupScope,
  selectFanoutPeers
} = require('./gossip/peer-group');
const {
  DOMAIN_EVENT_SCHEMA_VERSION,
  operationToDomainEvent,
  signDomainEvent,
  verifyDomainEvent,
  verifyEventChain,
  buildCheckpoint,
  createEmptyView,
  applyDomainEventToView
} = require('./cqrs/domain-events');
const {
  DEFAULT_LIVE_CAP,
  DEFAULT_BULK_INTERVAL_MS,
  assignPeerGroupTier,
  filterPeersByTier
} = require('./cqrs/peer-group-tiers');
const { electBulkRelays, DEFAULT_BULK_RELAY_COUNT } = require('./cqrs/bulk-relay');
const DignityQueryReplica = require('./cqrs/query-replica');
const {
  MANIFEST_SCHEMA_VERSION: DIGNITY_APP_MANIFEST_SCHEMA_VERSION,
  validateDignityAppManifest,
  collectionAllowed,
  getStoredCommand
} = require('./apps/manifest');
const {
  buildAppCsp,
  prepareSandboxedAppHtml,
  injectCspMeta
} = require('./apps/csp');
const {
  executeStoredCommand,
  isPublisherCommandCapable
} = require('./apps/stored-commands');
const {
  createHostRpcHandler,
  RPC_METHODS
} = require('./apps/bridge');
const {
  DignityAppHost,
  DEFAULT_SANDBOX
} = require('./apps/host');
const {
  createDignityAppClient,
  connectDignityAppClient,
  buildClientBootstrapScript,
  HANDSHAKE_TYPE
} = require('./apps/client');

module.exports = {
  DignityP2P,
  createDefaultSignalingPool,
  SignalingPool,
  WebSocketSignalingProvider,
  PeerJSSignalingProvider,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  PeerJSNetworkAdapter,
  createPeerJSNetworkAdapter,
  IndexedDBPersistence,
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS,
  VDF,
  SlothPermutation,
  MessageSecurityService,
  DEFAULT_SECURITY_OPTIONS,
  DEFAULT_APP_PASSWORD,
  deriveKeyPairFromCredentials,
  deriveColdRecoverySigningKey,
  keyPairToPublicBundle,
  createIdentityRotation,
  verifyIdentityRotation,
  revokeAndRotateIdentity,
  rotateIdentityPassword,
  enrollColdRecoveryPassword,
  verifyColdRecoveryEnrollment,
  shouldApplyIdentityRotation,
  parsePeerJsServerUrl,
  PEER_GROUP_SCOPE_PREFIX,
  DEFAULT_PEER_GROUP_OPTIONS,
  peerGroupScope,
  parsePeerGroupScope,
  selectFanoutPeers,
  DOMAIN_EVENT_SCHEMA_VERSION,
  operationToDomainEvent,
  signDomainEvent,
  verifyDomainEvent,
  verifyEventChain,
  buildCheckpoint,
  createEmptyView,
  applyDomainEventToView,
  DEFAULT_LIVE_CAP,
  DEFAULT_BULK_INTERVAL_MS,
  assignPeerGroupTier,
  filterPeersByTier,
  electBulkRelays,
  DEFAULT_BULK_RELAY_COUNT,
  DignityQueryReplica,
  DIGNITY_APP_MANIFEST_SCHEMA_VERSION,
  validateDignityAppManifest,
  collectionAllowed,
  getStoredCommand,
  buildAppCsp,
  prepareSandboxedAppHtml,
  injectCspMeta,
  executeStoredCommand,
  isPublisherCommandCapable,
  createHostRpcHandler,
  RPC_METHODS,
  DignityAppHost,
  DEFAULT_SANDBOX,
  createDignityAppClient,
  connectDignityAppClient,
  buildClientBootstrapScript,
  HANDSHAKE_TYPE
};
