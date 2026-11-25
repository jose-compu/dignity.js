/**
 * Origin simulcast publish helpers (#152 milestone 5, v1.12.0).
 * @experimental
 */

const { DEFAULT_LAYER_ID } = require('./media-chunk');
const { LAYER_IDS } = require('./rendition-ladder');

/**
 * @param {Uint8Array|ArrayBuffer|Buffer} bytes
 * @returns {Uint8Array}
 */
function toPayloadBytes(bytes) {
  if (bytes instanceof Uint8Array) {
    return bytes;
  }
  if (Buffer.isBuffer(bytes)) {
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes);
  }
  throw new TypeError('layer payload must be Uint8Array, Buffer, or ArrayBuffer');
}

/**
 * @param {Object} layer
 * @returns {{ layerId: string, payloadBytes: Uint8Array, keyframe: boolean }}
 */
function normalizeLayerEntry(layer) {
  if (!layer || typeof layer !== 'object') {
    throw new TypeError('each simulcast layer must be an object');
  }
  const layerId = typeof layer.layerId === 'string' ? layer.layerId.trim() : '';
  if (!layerId) {
    throw new TypeError('each simulcast layer requires layerId');
  }
  const raw = layer.payloadBytes != null ? layer.payloadBytes : layer.data;
  if (raw == null) {
    throw new TypeError(`layer ${layerId} requires payloadBytes or data`);
  }
  return {
    layerId,
    payloadBytes: toPayloadBytes(raw),
    keyframe: Boolean(layer.keyframe)
  };
}

/**
 * Normalize injected multi-layer frames from arrays or maps.
 * @param {Object | Object[]} frameOrLayers — full frame with `.layers` or a layer list / map
 * @returns {{ layerId: string, payloadBytes: Uint8Array, keyframe: boolean }[]}
 */
function normalizeSimulcastLayers(frameOrLayers) {
  if (frameOrLayers == null) {
    throw new TypeError('simulcast input is required');
  }

  let rawLayers;
  if (Array.isArray(frameOrLayers)) {
    rawLayers = frameOrLayers;
  } else if (Array.isArray(frameOrLayers.layers)) {
    rawLayers = frameOrLayers.layers;
  } else if (frameOrLayers.layers && typeof frameOrLayers.layers === 'object') {
    rawLayers = Object.entries(frameOrLayers.layers).map(([layerId, value]) => ({
      layerId,
      ...(value && typeof value === 'object' ? value : { data: value })
    }));
  } else {
    throw new TypeError('frame must provide layers as an array or map');
  }

  if (rawLayers.length === 0) {
    throw new Error('simulcast tick requires at least one layer');
  }

  return rawLayers.map(normalizeLayerEntry);
}

/**
 * @returns {{ next: (layerId?: string) => number, peek: (layerId?: string) => number, snapshot: () => Map<string, number> }}
 */
function createLayerSequenceTracker() {
  /** @type {Map<string, number>} */
  const nextByLayer = new Map();

  function resolveLayerId(layerId) {
    return typeof layerId === 'string' && layerId.trim() !== '' ? layerId.trim() : DEFAULT_LAYER_ID;
  }

  return {
    next(layerId) {
      const id = resolveLayerId(layerId);
      const seq = nextByLayer.get(id) ?? 0;
      nextByLayer.set(id, seq + 1);
      return seq;
    },
    peek(layerId) {
      const id = resolveLayerId(layerId);
      return nextByLayer.get(id) ?? 0;
    },
    snapshot() {
      return new Map(nextByLayer);
    }
  };
}

/**
 * Scripted end-to-end simulcast load trace (origin → relay → viewers).
 * @param {Object} options
 * @param {import('./public-stream-path').InMemoryStreamSignalingBus} options.bus
 * @param {import('./public-stream-path').PublicStreamBroadcaster} options.broadcaster
 * @param {import('./public-stream-path').PublicStreamRelay} options.relay
 * @param {import('./public-stream-path').PublicStreamViewer} options.viewerHealthy
 * @param {import('./public-stream-path').PublicStreamViewer} options.viewerDegraded
 * @param {import('./layer-selector').ReturnType<typeof import('./layer-selector').createLayerSelector>} options.viewerSelectorDegraded
 * @param {import('./playout-buffer').ReturnType<typeof import('./playout-buffer').createPlayoutBuffer>} [options.playoutDegraded]
 * @param {import('./bandwidth-estimator').ReturnType<typeof import('./bandwidth-estimator').createBandwidthEstimator>} options.estimatorDegraded
 * @param {string} options.degradedChildId
 * @param {string} options.healthyChildId
 * @param {string} options.sessionId
 * @param {number} options.l0Bps
 * @param {number} options.l1Bps
 * @param {number} options.l2Bps
 * @param {(layerId: string) => Uint8Array} [options.payloadForLayer]
 * @returns {{
 *   publishedLayerIds: string[],
 *   relayLayerHealthy: string,
 *   relayLayerDegraded: string,
 *   viewerLayerDegraded: string,
 *   logLines: string[]
 * }}
 */
function runSimulcastLoadTrace({
  bus,
  broadcaster,
  relay,
  viewerHealthy,
  viewerDegraded,
  viewerSelectorDegraded,
  playoutDegraded,
  estimatorDegraded,
  degradedChildId,
  healthyChildId,
  sessionId,
  l0Bps,
  l1Bps,
  l2Bps,
  payloadForLayer = () => new Uint8Array([1])
}) {
  void bus;

  const publishedLayerIds = [];
  const logLines = [];
  const tickMs = 5000;

  const degradedScript = [
    { ts: tickMs, bytes: Math.floor(l2Bps / 8), loss: 0, delay: 0 },
    { ts: tickMs + 1000, bytes: Math.floor(l1Bps / 8) - 1000, loss: 0, delay: 0 },
    { ts: tickMs + 1200, bytes: Math.floor(l0Bps / 8) - 5000, loss: 0, delay: 0 },
    { ts: tickMs + 1500, bytes: Math.floor(l0Bps / 8) - 8000, loss: 0, delay: 8 },
    { ts: tickMs + 2500, bytes: Math.floor(l0Bps / 8) - 8000, loss: 0, delay: 8 },
    { ts: tickMs + 4000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 },
    { ts: tickMs + 5000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 },
    { ts: tickMs + 6000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 },
    { ts: tickMs + 7000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 },
    { ts: tickMs + 8000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 },
    { ts: tickMs + 9000, bytes: Math.floor(l1Bps / 8), loss: 0, delay: 0 }
  ];

  const { createReceiverReport } = require('./receiver-report');
  let prevTs = degradedScript[0].ts;
  let viewerLayerDegraded = viewerSelectorDegraded.getLayerId();
  for (const step of degradedScript) {
    const intervalMs = step.ts - prevTs || 1000;
    prevTs = step.ts;
    relay.observeChildReport(
      healthyChildId,
      createReceiverReport({
        sessionId,
        viewerId: healthyChildId,
        layerId: relay.getChildLayer(healthyChildId) || 'L2',
        timestampMs: step.ts,
        intervalMs,
        bytesReceived: Math.ceil((l2Bps / 8) * 1.05),
        packetsReceived: 1000,
        packetsLost: 0,
        interarrivalDelayMs: 0
      })
    );
    const degradedReport = createReceiverReport({
      sessionId,
      viewerId: degradedChildId,
      layerId: relay.getChildLayer(degradedChildId) || 'L2',
      timestampMs: step.ts,
      intervalMs,
      bytesReceived: step.bytes,
      packetsReceived: 1000,
      packetsLost: step.loss,
      interarrivalDelayMs: step.delay
    });
    relay.observeChildReport(degradedChildId, degradedReport);
    const estimateBps = estimatorDegraded.observe(degradedReport);
    if (playoutDegraded) {
      playoutDegraded.observeReport(degradedReport);
    }
    viewerLayerDegraded = viewerSelectorDegraded.selectLayer({ estimateBps, nowMs: step.ts });
  }

  const tickLayers = LAYER_IDS.map((layerId) => ({
    layerId,
    payloadBytes: payloadForLayer(layerId),
    keyframe: layerId === 'L0'
  }));
  const chunks = broadcaster.publishSimulcastTick(tickLayers, {
    timestampMs: tickMs + 10000,
    profile: 'hd720'
  });
  for (const chunk of chunks) {
    publishedLayerIds.push(chunk.layerId);
  }
  logLines.push(`published layers: ${publishedLayerIds.join(' ')}`);

  const relayLayerHealthy = relay.getChildLayer(healthyChildId) || 'L2';
  const relayLayerDegraded = relay.getChildLayer(degradedChildId) || 'L2';
  logLines.push(`relay forwards: ${relayLayerDegraded}`);
  logLines.push(`viewer layer: ${viewerLayerDegraded}`);

  void viewerHealthy;
  void viewerDegraded;

  return {
    publishedLayerIds,
    relayLayerHealthy,
    relayLayerDegraded,
    viewerLayerDegraded,
    logLines
  };
}

module.exports = {
  normalizeSimulcastLayers,
  createLayerSequenceTracker,
  runSimulcastLoadTrace
};