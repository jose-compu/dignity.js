import {
  DignityP2P,
  InMemoryNetworkAdapter,
  InMemoryNetworkHub,
  STREAM_ACCESS_MODES,
  createInMemoryStreamSignalingBus,
  createStreamSession,
  parseAnnexBAccessUnits,
  demuxMpegTs,
  createLayerSelector,
  createBandwidthEstimator,
  createPlayoutBuffer,
  createRelayLayerPolicy,
  normalizeSimulcastLayers,
  runSimulcastLoadTrace,
  runScaleSimulation,
  RENDITION_PROFILE_HD720,
  hashReflectiveLogic,
  type CompatibilityPolicy,
  type DignityRecord
} from 'dignity.js';
import { createFileMediaIngest, createMpegTsIngest, createNodeStreamOrigin } from 'dignity.js/node';

// In-memory hub + adapter: wires multiple local nodes without WebRTC (smoke / typecheck only).
const hub = new InMemoryNetworkHub();
const node: DignityP2P = new DignityP2P({
  // nodeId is this peer's public identity in the mesh (here a fixed label for the example).
  nodeId: 'ts-smoke',
  networkAdapter: new InMemoryNetworkAdapter(hub),
  security: { powEnabled: false, signingEnabled: false, encryptionEnabled: false }
});

const policy: CompatibilityPolicy = 'strict';

// registerVerification pins collection rules and optional reflective logic versioning on this node.
node.registerVerification('scores', {
  code: {
    max: 100,
    validate(record: DignityRecord) {
      return (record.data.points as number) <= 100;
    }
  },
  reflective: true,
  version: '0.14.0',
  policy
});

// hashReflectiveLogic fingerprints verifier code under the chosen compatibility policy.
const reflective = hashReflectiveLogic({ check() { return true; } }, { policy });
const hashPrefix: string = reflective.hash.slice(0, 7);

void node;
void hashPrefix;

const privateListSession = createStreamSession({
  sessionId: 'ts-private-list',
  broadcasterId: 'origin',
  mode: STREAM_ACCESS_MODES.PRIVATE_LIST,
  privateRecipients: ['recipient-signing-key']
});
const privateListOrigin = createNodeStreamOrigin({
  session: privateListSession,
  signingSecretKey: new Uint8Array(64),
  signingPublicKey: 'broadcaster-signing',
  broadcasterEncryptionSecretKey: new Uint8Array(32),
  broadcasterEncryptionPublicKey: 'broadcaster-encryption',
  recipientPublicBundles: [
    { signingPublicKey: 'recipient-signing-key', encryptionPublicKey: 'recipient-encryption' }
  ],
  bus: createInMemoryStreamSignalingBus(),
  mediaIngest: createFileMediaIngest({ filePath: __dirname + '/../../tests/fixtures/stream-origin-chunks.bin' })
});
void privateListOrigin.rotateRecipients;

const annexFrame = parseAnnexBAccessUnits(new Uint8Array([0, 0, 0, 1, 0x65]))[0];
void annexFrame?.keyframe;
void demuxMpegTs(new Uint8Array(188).fill(0xff)).length;
void createMpegTsIngest({ input: __dirname + '/../../tests/fixtures/mpegts-h264.ts' });

const layerSelector = createLayerSelector({ profile: RENDITION_PROFILE_HD720 });
void layerSelector.getLayerId();
const bwEst = createBandwidthEstimator({ floorBps: 400_000, ceilingBps: 4_000_000 });
void bwEst.getEstimateBps();
const playoutBuf = createPlayoutBuffer();
void playoutBuf.getTargetDelayMs();
const relayPolicy = createRelayLayerPolicy({ floorBps: 400_000, ceilingBps: 4_000_000 });
void normalizeSimulcastLayers({ layers: [{ layerId: 'L0', payloadBytes: new Uint8Array([1]) }] });
const simulcastTrace: typeof runSimulcastLoadTrace = runSimulcastLoadTrace;
void simulcastTrace;
const scaleSim: typeof runScaleSimulation = runScaleSimulation;
void scaleSim().claim.status;
void relayPolicy.chunkLayerId;