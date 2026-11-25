/**
 * Optional native WebRTC peer for Node.js (milestone 10, #152).
 * Loads node-datachannel or werift at runtime — not bundled.
 * @experimental
 */

const { EventEmitter } = require('events');

const NODE_WEBRTC_PEER_LIBRARY_MISSING = 'NODE_WEBRTC_PEER_LIBRARY_MISSING';
const DEFAULT_ICE_SERVERS = ['stun:stun.l.google.com:19302'];
const DATA_CHANNEL_LABEL = 'dignity-stream';
const WHIP_DATA_CHANNEL_LABEL = 'dignity-ingest';

class NodeWebRTCPeerLibraryMissingError extends Error {
  /**
   * @param {string[]} tried
   * @param {string} [detail]
   */
  constructor(tried, detail) {
    const pkgs = tried.length ? tried.join(' or ') : 'node-datachannel or werift';
    const msg =
      `No optional Node WebRTC peer library is installed (${detail || 'dynamic import failed'}). ` +
      `Install one: npm install ${pkgs}`;
    super(msg);
    this.name = 'NodeWebRTCPeerLibraryMissingError';
    this.code = NODE_WEBRTC_PEER_LIBRARY_MISSING;
    this.triedPackages = tried;
  }
}

/**
 * @param {string} name
 * @param {(id: string) => import('module')} [loadModule]
 */
async function defaultLoadPeerModule(id) {
  try {
    return require(id);
  } catch {
    return import(id);
  }
}

async function loadBackendByName(name, loadModule = defaultLoadPeerModule) {
  if (name === 'node-datachannel') {
    const mod = await loadModule('node-datachannel');
    return createNodeDatachannelBackend(mod.default || mod);
  }
  if (name === 'werift') {
    const mod = await loadModule('werift');
    return createWeriftBackend(mod);
  }
  throw new Error(`Unknown Node WebRTC backend: ${name}`);
}

/**
 * @param {object} options
 * @param {'auto' | 'node-datachannel' | 'werift'} [options.backend]
 * @param {string[]} [options.iceServers]
 * @param {(id: string) => Promise<unknown>} [options.loadModule]
 * @param {ReturnType<typeof createFakeNodeWebRTCBackend>} [options.testBackend]
 */
async function resolveNodeWebRTCBackend(options = {}) {
  if (options.testBackend) {
    return options.testBackend;
  }
  const loadModule = options.loadModule || defaultLoadPeerModule;
  const preference =
    options.backend && options.backend !== 'auto'
      ? [options.backend]
      : ['node-datachannel', 'werift'];
  const errors = [];
  for (const name of preference) {
    try {
      return await loadBackendByName(name, loadModule);
    } catch (err) {
      errors.push(`${name}: ${err && err.message ? err.message : String(err)}`);
    }
  }
  throw new NodeWebRTCPeerLibraryMissingError(preference, errors.join('; '));
}

/**
 * @param {object} ndc
 */
function createNodeDatachannelBackend(ndc) {
  if (!ndc || typeof ndc.PeerConnection !== 'function') {
    throw new Error('node-datachannel PeerConnection export missing');
  }
  return {
    name: 'node-datachannel',
    createPeerConnection(peerId, iceServers) {
      const pc = new ndc.PeerConnection(String(peerId), {
        iceServers: iceServers && iceServers.length ? iceServers : DEFAULT_ICE_SERVERS
      });
      return {
        raw: pc,
        onLocalDescription(handler) {
          pc.onLocalDescription(handler);
        },
        onLocalCandidate(handler) {
          pc.onLocalCandidate(handler);
        },
        onDataChannel(handler) {
          pc.onDataChannel(handler);
        },
        setRemoteDescription(sdp, type) {
          pc.setRemoteDescription(sdp, type);
        },
        addRemoteCandidate(candidate, mid) {
          pc.addRemoteCandidate(candidate, mid);
        },
        createDataChannel(label) {
          return pc.createDataChannel(label);
        },
        close() {
          pc.close();
        }
      };
    },
    wireSignaling(peerA, peerB) {
      peerA.raw.onLocalDescription((sdp, type) => {
        peerB.setRemoteDescription(sdp, type);
      });
      peerA.raw.onLocalCandidate((candidate, mid) => {
        peerB.addRemoteCandidate(candidate, mid);
      });
      peerB.raw.onLocalDescription((sdp, type) => {
        peerA.setRemoteDescription(sdp, type);
      });
      peerB.raw.onLocalCandidate((candidate, mid) => {
        peerA.addRemoteCandidate(candidate, mid);
      });
    },
    bindDataChannel(dc) {
      return {
        onOpen(handler) {
          dc.onOpen(handler);
        },
        onMessage(handler) {
          dc.onMessage(handler);
        },
        onClose(handler) {
          if (typeof dc.onClosed === 'function') {
            dc.onClosed(handler);
          }
        },
        sendString(text) {
          dc.sendMessage(text);
        },
        sendBinary(buffer) {
          dc.sendMessageBinary(buffer);
        },
        close() {
          if (typeof dc.close === 'function') {
            dc.close();
          }
        }
      };
    },
    waitForLocalDescription(peer, expectedType, timeoutMs = 15000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Timed out waiting for local ${expectedType}`));
        }, timeoutMs);
        peer.onLocalDescription((sdp, type) => {
          if (type === expectedType) {
            clearTimeout(timer);
            resolve(sdp);
          }
        });
      });
    },
    waitForRemoteDataChannel(peer, timeoutMs = 15000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Timed out waiting for remote data channel'));
        }, timeoutMs);
        peer.onDataChannel((dc) => {
          clearTimeout(timer);
          resolve(dc);
        });
      });
    },
    waitForOpen(dcBinding, timeoutMs = 15000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Timed out waiting for data channel open'));
        }, timeoutMs);
        dcBinding.onOpen(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  };
}

/**
 * Minimal werift backend — data-channel SCTP only (no bundled encode path).
 * @param {object} werift
 */
function createWeriftBackend(werift) {
  const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = werift;
  if (typeof RTCPeerConnection !== 'function') {
    throw new Error('werift RTCPeerConnection export missing');
  }

  return {
    name: 'werift',
    createPeerConnection(peerId, iceServers) {
      const ice = (iceServers && iceServers.length ? iceServers : DEFAULT_ICE_SERVERS).map((url) => ({
        urls: url
      }));
      const pc = new RTCPeerConnection({ iceServers: ice });
      const channelWaiters = [];
      pc.ondatachannel = (ev) => {
        for (const w of channelWaiters) {
          w(ev.channel);
        }
        channelWaiters.length = 0;
      };
      return {
        raw: pc,
        onLocalDescription(handler) {
          pc.onnegotiationneeded = async () => {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              handler(offer.sdp, offer.type);
            } catch (err) {
              handler(null, 'error');
            }
          };
        },
        onLocalCandidate(handler) {
          pc.onicecandidate = (ev) => {
            if (ev.candidate) {
              handler(ev.candidate.candidate, ev.candidate.sdpMid || '0');
            }
          };
        },
        onDataChannel(handler) {
          channelWaiters.push(handler);
        },
        setRemoteDescription(sdp, type) {
          return pc.setRemoteDescription(new RTCSessionDescription({ sdp, type }));
        },
        addRemoteCandidate(candidate, mid) {
          return pc.addIceCandidate(
            new RTCIceCandidate({ candidate, sdpMid: mid, sdpMLineIndex: 0 })
          );
        },
        createDataChannel(label) {
          return pc.createDataChannel(label);
        },
        close() {
          pc.close();
        }
      };
    },
    wireSignaling(peerA, peerB) {
      peerA.raw.onicecandidate = (ev) => {
        if (ev.candidate) {
          peerB.addRemoteCandidate(ev.candidate.candidate, ev.candidate.sdpMid || '0');
        }
      };
      peerB.raw.onicecandidate = (ev) => {
        if (ev.candidate) {
          peerA.addRemoteCandidate(ev.candidate.candidate, ev.candidate.sdpMid || '0');
        }
      };
      peerA.raw.ontrack = () => {};
      peerB.raw.ontrack = () => {};
    },
    bindDataChannel(dc) {
      return {
        onOpen(handler) {
          dc.onopen = () => handler();
        },
        onMessage(handler) {
          dc.onmessage = (ev) => {
            if (typeof ev.data === 'string') {
              handler(ev.data);
            } else if (ev.data instanceof Uint8Array) {
              handler(Buffer.from(ev.data).toString('utf8'));
            } else if (ev.data && typeof ev.data.arrayBuffer === 'function') {
              ev.data.arrayBuffer().then((ab) => {
                handler(Buffer.from(ab).toString('utf8'));
              });
            }
          };
        },
        onClose(handler) {
          dc.onclose = () => handler();
        },
        sendString(text) {
          dc.send(text);
        },
        sendBinary(buffer) {
          dc.send(buffer);
        },
        close() {
          dc.close();
        }
      };
    },
    waitForLocalDescription(peer, expectedType, timeoutMs = 15000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Timed out waiting for local ${expectedType}`));
        }, timeoutMs);
        const poll = async () => {
          const desc = peer.raw.localDescription;
          if (desc && desc.type === expectedType) {
            clearTimeout(timer);
            resolve(desc.sdp);
            return;
          }
          setTimeout(poll, 20);
        };
        poll();
      });
    },
    waitForRemoteDataChannel(peer, timeoutMs = 15000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Timed out waiting for remote data channel'));
        }, timeoutMs);
        peer.onDataChannel((dc) => {
          clearTimeout(timer);
          resolve(dc);
        });
      });
    },
    waitForOpen(dcBinding, timeoutMs = 15000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Timed out waiting for data channel open'));
        }, timeoutMs);
        dcBinding.onOpen(() => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  };
}

function encodeWireEnvelope(message) {
  return JSON.stringify({ type: 'dignity-envelope', payload: message });
}

function decodeWireEnvelope(raw) {
  if (typeof raw !== 'string') {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.type === 'dignity-envelope' && parsed.payload) {
      return parsed.payload;
    }
    return parsed;
  } catch {
    return null;
  }
}

function decodeIngestFrameMessage(raw) {
  const payload = decodeWireEnvelope(raw);
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  if (payload.ingestFrame && payload.ingestFrame.payloadBytes) {
    const bytes = payload.ingestFrame.payloadBytes;
    const payloadBytes =
      bytes instanceof Uint8Array
        ? bytes
        : typeof bytes === 'string'
          ? Uint8Array.from(Buffer.from(bytes, 'base64'))
          : null;
    if (!payloadBytes) {
      return null;
    }
    return { ...payload.ingestFrame, payloadBytes };
  }
  if (payload.payloadBytes) {
    const bytes = payload.payloadBytes;
    const payloadBytes =
      bytes instanceof Uint8Array
        ? bytes
        : typeof bytes === 'string'
          ? Uint8Array.from(Buffer.from(bytes, 'base64'))
          : null;
    if (!payloadBytes) {
      return null;
    }
    return { ...payload, payloadBytes };
  }
  return null;
}

class NodeWebRTCNetworkAdapter extends EventEmitter {
  /**
   * @param {string} nodeId
   * @param {NodeWebRTCPeerFactory} factory
   */
  constructor(nodeId, factory) {
    super();
    this.nodeId = nodeId;
    this._factory = factory;
    /** @type {Map<string, ReturnType<typeof createNodeDatachannelBackend>['bindDataChannel']>} */
    this._channels = new Map();
    /** @type {Set<(message: object) => void>} */
    this._messageHandlers = new Set();
    this._started = false;
  }

  async start(nodeId = this.nodeId) {
    this.nodeId = nodeId;
    this._started = true;
    this._factory._registerAdapter(this);
  }

  async stop() {
    this._factory._unregisterAdapter(this);
    for (const binding of this._channels.values()) {
      binding.close();
    }
    this._channels.clear();
    this._started = false;
  }

  async connectToPeer(remotePeerId) {
    if (!this._started) {
      throw new Error('Network adapter has not been started');
    }
    if (this._channels.has(remotePeerId)) {
      return;
    }
    await this._factory._ensurePeerLink(this.nodeId, remotePeerId);
  }

  listOpenPeerIds() {
    return [...this._channels.keys()];
  }

  /**
   * @param {string} remotePeerId
   * @param {ReturnType<typeof createNodeDatachannelBackend>['bindDataChannel']} binding
   */
  _attachRemoteChannel(remotePeerId, binding) {
    this._channels.set(remotePeerId, binding);
    binding.onMessage((raw) => {
      const message = decodeWireEnvelope(raw);
      if (message) {
        this._deliver(message);
      }
    });
    binding.onClose(() => {
      this._channels.delete(remotePeerId);
    });
    this.emit('peer-connected', remotePeerId);
  }

  _deliver(message) {
    this.emit('message', message);
    for (const handler of this._messageHandlers) {
      handler(message);
    }
  }

  onMessage(handler) {
    this._messageHandlers.add(handler);
  }

  offMessage(handler) {
    this._messageHandlers.delete(handler);
  }

  async send(peerId, message) {
    const binding = this._channels.get(peerId);
    if (!binding) {
      throw new Error(`Not connected to peer ${peerId}`);
    }
    binding.sendString(encodeWireEnvelope(message));
  }

  async sendToPeers(message, peerIds = []) {
    for (const peerId of peerIds) {
      if (peerId && peerId !== this.nodeId) {
        await this.send(peerId, message);
      }
    }
  }

  async broadcast(message) {
    const ids = [...this._channels.keys()];
    await this.sendToPeers(message, ids);
  }
}

class NodeWebRTCPeerFactory {
  /**
   * @param {Awaited<ReturnType<typeof resolveNodeWebRTCBackend>>} backend
   * @param {object} options
   */
  constructor(backend, options = {}) {
    this.backend = backend;
    this.iceServers = options.iceServers || DEFAULT_ICE_SERVERS;
    /** @type {Map<string, NodeWebRTCNetworkAdapter>} */
    this._adapters = new Map();
    /** @type {Map<string, Promise<void>>} */
    this._linkPromises = new Map();
    /** @type {Set<string>} */
    this._openPeers = new Set();
    /** @type {Array<{ close?: () => void }>} */
    this._peerConnections = [];
  }

  /**
   * Factory function matching WHIP `createWhipIngest({ peerFactory })`.
   */
  createWhipPeerFactory() {
    const backend = this.backend;
    const iceServers = this.iceServers;
    return async (offerSdp, ctx) => {
      const peer = backend.createPeerConnection(`whip-${ctx.resourceId}`, iceServers);
      const answerPromise = backend.waitForLocalDescription(peer, 'answer');
      let whipChannelBinding = null;
      let frameCb = null;

      peer.setRemoteDescription(offerSdp, 'offer');
      peer.onDataChannel((dc) => {
        const binding = backend.bindDataChannel(dc);
        whipChannelBinding = binding;
        binding.onMessage((raw) => {
          const frame = decodeIngestFrameMessage(raw);
          if (frame && typeof frameCb === 'function') {
            frameCb(frame);
          }
        });
      });

      const answerSdp = await answerPromise;
      return {
        answerSdp,
        onFrame(cb) {
          frameCb = cb;
        },
        close() {
          if (whipChannelBinding) {
            whipChannelBinding.close();
          }
          peer.close();
        }
      };
    };
  }

  async createNetworkAdapter(nodeId) {
    const adapter = new NodeWebRTCNetworkAdapter(nodeId, this);
    await adapter.start(nodeId);
    return adapter;
  }

  _registerAdapter(adapter) {
    this._adapters.set(adapter.nodeId, adapter);
  }

  _unregisterAdapter(adapter) {
    this._adapters.delete(adapter.nodeId);
  }

  /**
   * @param {string} localId
   * @param {string} remoteId
   */
  async _ensurePeerLink(localId, remoteId) {
    const key = [localId, remoteId].sort().join('::');
    if (this._linkPromises.has(key)) {
      await this._linkPromises.get(key);
      return;
    }
    const work = this._linkPair(localId, remoteId);
    this._linkPromises.set(key, work);
    try {
      await work;
    } finally {
      this._linkPromises.delete(key);
    }
  }

  async _linkPair(localId, remoteId) {
    const local = this._adapters.get(localId);
    const remote = this._adapters.get(remoteId);
    if (!local || !remote) {
      throw new Error(`Both peers must register adapters before linking (${localId}, ${remoteId})`);
    }
    if (local._channels.has(remoteId)) {
      return;
    }

    const offererId = localId < remoteId ? localId : remoteId;
    const answererId = localId < remoteId ? remoteId : localId;
    const offerer = this._adapters.get(offererId);
    const answerer = this._adapters.get(answererId);

    if (this.backend.name === 'fake' && typeof this.backend.linkAdapterPair === 'function') {
      this.backend.linkAdapterPair(offererId, answererId, offerer, answerer);
      this._openPeers.add(offererId);
      this._openPeers.add(answererId);
      return;
    }

    const peerOffer = this.backend.createPeerConnection(offererId, this.iceServers);
    const peerAnswer = this.backend.createPeerConnection(answererId, this.iceServers);
    this._peerConnections.push(peerOffer, peerAnswer);
    this.backend.wireSignaling(peerOffer, peerAnswer);

    const offerDcRaw = peerOffer.createDataChannel(DATA_CHANNEL_LABEL);
    const offerBinding = this.backend.bindDataChannel(offerDcRaw);
    const remoteDcPromise = this.backend.waitForRemoteDataChannel(peerAnswer);

    if (this.backend.name === 'werift') {
      const offer = await peerOffer.raw.createOffer();
      await peerOffer.raw.setLocalDescription(offer);
      await peerAnswer.setRemoteDescription(offer.sdp, offer.type);
      const answer = await peerAnswer.raw.createAnswer();
      await peerAnswer.raw.setLocalDescription(answer);
      await peerOffer.setRemoteDescription(answer.sdp, answer.type);
    }

    const remoteDcRaw = await remoteDcPromise;
    const answerBinding = this.backend.bindDataChannel(remoteDcRaw);

    await Promise.all([
      this.backend.waitForOpen(offerBinding),
      this.backend.waitForOpen(answerBinding)
    ]);

    offerer._attachRemoteChannel(answererId, offerBinding);
    answerer._attachRemoteChannel(offererId, answerBinding);

    this._openPeers.add(offererId);
    this._openPeers.add(answererId);
  }

  async close() {
    for (const adapter of this._adapters.values()) {
      await adapter.stop();
    }
    for (const peer of this._peerConnections) {
      if (peer && typeof peer.close === 'function') {
        peer.close();
      }
    }
    this._adapters.clear();
    this._linkPromises.clear();
    this._openPeers.clear();
    this._peerConnections.length = 0;
  }
}

/**
 * @param {object} [options]
 */
async function createNodeWebRTCPeerFactory(options = {}) {
  const backend = await resolveNodeWebRTCBackend(options);
  return new NodeWebRTCPeerFactory(backend, options);
}

/**
 * In-memory fake backend for unit tests (no native library).
 */
function createFakeNodeWebRTCBackend() {
  /** @type {Map<string, { peers: Set<string>, bindings: Map<string, object> }>} */
  const nodes = new Map();

  function pairKey(a, b) {
    return [a, b].sort().join('::');
  }

  function ensureNode(id) {
    if (!nodes.has(id)) {
      nodes.set(id, { peers: new Set(), bindings: new Map() });
    }
    return nodes.get(id);
  }

  function deliver(from, to, raw) {
    const n = ensureNode(to);
    const binding = n.bindings.get(from);
    if (binding && typeof binding._onMessage === 'function') {
      binding._onMessage(raw);
    }
  }

  return {
    name: 'fake',
    createPeerConnection(peerId) {
      ensureNode(peerId);
      return {
        raw: { peerId },
        onLocalDescription() {},
        onLocalCandidate() {},
        onDataChannel() {},
        setRemoteDescription() {},
        addRemoteCandidate() {},
        createDataChannel() {
          return { label: DATA_CHANNEL_LABEL };
        },
        close() {}
      };
    },
    wireSignaling() {},
    bindDataChannel(dc) {
      const binding = {
        _onMessage: null,
        onOpen(handler) {
          handler();
        },
        onMessage(handler) {
          binding._onMessage = handler;
        },
        onClose() {},
        sendString(text) {
          const peerId = dc._peerId;
          const remoteId = dc._remoteId;
          if (peerId && remoteId) {
            deliver(peerId, remoteId, text);
          }
        },
        sendBinary() {},
        close() {}
      };
      return binding;
    },
    waitForLocalDescription(_peer, expectedType) {
      return Promise.resolve(`fake-${expectedType}-sdp`);
    },
    waitForRemoteDataChannel() {
      return Promise.resolve({ label: DATA_CHANNEL_LABEL, _paired: true });
    },
    waitForOpen() {
      return Promise.resolve();
    },
    linkAdapterPair(offererId, answererId, offererAdapter, answererAdapter) {
      const oDc = { label: DATA_CHANNEL_LABEL, _peerId: offererId, _remoteId: answererId };
      const aDc = { label: DATA_CHANNEL_LABEL, _peerId: answererId, _remoteId: offererId };
      const ob = this.bindDataChannel(oDc);
      const ab = this.bindDataChannel(aDc);
      ob.sendString = (text) => {
        if (ab._onMessage) {
          ab._onMessage(text);
        }
      };
      ab.sendString = (text) => {
        if (ob._onMessage) {
          ob._onMessage(text);
        }
      };
      offererAdapter._attachRemoteChannel(answererId, ob);
      answererAdapter._attachRemoteChannel(offererId, ab);
      ensureNode(offererId).peers.add(answererId);
      ensureNode(answererId).peers.add(offererId);
    }
  };
}

module.exports = {
  NODE_WEBRTC_PEER_LIBRARY_MISSING,
  NodeWebRTCPeerLibraryMissingError,
  NodeWebRTCPeerFactory,
  NodeWebRTCNetworkAdapter,
  createNodeWebRTCPeerFactory,
  resolveNodeWebRTCBackend,
  createFakeNodeWebRTCBackend,
  createNodeDatachannelBackend,
  decodeWireEnvelope,
  decodeIngestFrameMessage,
  WHIP_DATA_CHANNEL_LABEL,
  DATA_CHANNEL_LABEL
};