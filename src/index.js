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
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS
} = require('./signaling/default-signaling-config');
const VDF = require('./security/vdf');
const SlothPermutation = require('./security/sloth-vdf');
const {
  MessageSecurityService,
  DEFAULT_SECURITY_OPTIONS
} = require('./security/message-security-service');

module.exports = {
  DignityP2P,
  createDefaultSignalingPool,
  SignalingPool,
  WebSocketSignalingProvider,
  PeerJSSignalingProvider,
  InMemoryNetworkHub,
  InMemoryNetworkAdapter,
  DEFAULT_CLOUDFLARE_SIGNALING_URLS,
  DEFAULT_SIGNALING_FALLBACK_URLS,
  VDF,
  SlothPermutation,
  MessageSecurityService,
  DEFAULT_SECURITY_OPTIONS
};
