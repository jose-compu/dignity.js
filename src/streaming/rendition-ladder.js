/**
 * HD / FHD rendition ladders for adaptive streaming (#152 milestone 5).
 * @experimental
 */

const RENDITION_PROFILE_HD720 = 'hd720';
const RENDITION_PROFILE_FHD1080 = 'fhd1080';

const RENDITION_LADDERS = Object.freeze({
  [RENDITION_PROFILE_HD720]: Object.freeze({
    L0: Object.freeze({ width: 640, height: 360, videoBitrateKbps: 400, audioBitrateKbps: 48 }),
    L1: Object.freeze({ width: 1280, height: 720, videoBitrateKbps: 1800, audioBitrateKbps: 64 }),
    L2: Object.freeze({ width: 1280, height: 720, videoBitrateKbps: 3000, audioBitrateKbps: 96 })
  }),
  [RENDITION_PROFILE_FHD1080]: Object.freeze({
    L0: Object.freeze({ width: 854, height: 480, videoBitrateKbps: 800, audioBitrateKbps: 48 }),
    L1: Object.freeze({ width: 1920, height: 1080, videoBitrateKbps: 4500, audioBitrateKbps: 96 }),
    L2: Object.freeze({ width: 1920, height: 1080, videoBitrateKbps: 8000, audioBitrateKbps: 128 })
  })
});

const LAYER_IDS = Object.freeze(['L0', 'L1', 'L2']);
const AUDIO_LAYER_ID = 'A0';

/**
 * @param {'hd720' | 'fhd1080'} profile
 * @param {'L0' | 'L1' | 'L2'} layerId
 * @returns {{ profile: string, layerId: string, width: number, height: number, videoBitrateKbps: number, audioBitrateKbps: number }}
 */
function resolveRendition(profile, layerId) {
  if (typeof profile !== 'string' || profile.trim() === '') {
    throw new TypeError('profile must be a non-empty string');
  }
  if (typeof layerId !== 'string' || layerId.trim() === '') {
    throw new TypeError('layerId must be a non-empty string');
  }
  const ladder = RENDITION_LADDERS[profile];
  if (!ladder) {
    throw new Error(`Unknown rendition profile: ${profile}`);
  }
  const row = ladder[layerId];
  if (!row) {
    throw new Error(`Unknown layerId ${layerId} for profile ${profile}`);
  }
  return {
    profile,
    layerId,
    width: row.width,
    height: row.height,
    videoBitrateKbps: row.videoBitrateKbps,
    audioBitrateKbps: row.audioBitrateKbps
  };
}

/**
 * @param {{ profile: string, layerId: string, width: number, height: number, videoBitrateKbps: number, audioBitrateKbps: number }} rendition
 * @returns {boolean}
 */
function renditionMatchesLadder(rendition) {
  if (!rendition || typeof rendition !== 'object') {
    return false;
  }
  const expected = resolveRendition(rendition.profile, rendition.layerId);
  return (
    expected.width === rendition.width &&
    expected.height === rendition.height &&
    expected.videoBitrateKbps === rendition.videoBitrateKbps &&
    expected.audioBitrateKbps === rendition.audioBitrateKbps &&
    expected.layerId === rendition.layerId &&
    expected.profile === rendition.profile
  );
}

/**
 * Audio-only signed chunks use a dedicated track id (separate from video L0–L2).
 * @param {'hd720' | 'fhd1080'} profile
 * @returns {{ profile: string, layerId: string, width: number, height: number, videoBitrateKbps: number, audioBitrateKbps: number }}
 */
function resolveAudioRendition(profile) {
  const base = resolveRendition(profile, 'L0');
  return {
    profile: base.profile,
    layerId: AUDIO_LAYER_ID,
    width: 0,
    height: 0,
    videoBitrateKbps: 0,
    audioBitrateKbps: base.audioBitrateKbps
  };
}

/**
 * Map AV1 SVC spatial/temporal indices onto ladder layer ids (relays unchanged).
 * @param {number} spatialLayerId
 * @param {number} [temporalLayerId]
 * @returns {'L0' | 'L1' | 'L2'}
 */
function mapSvcLayersToLayerId(spatialLayerId, temporalLayerId = 0) {
  const spatial = Number.isFinite(spatialLayerId) ? Math.max(0, Math.floor(spatialLayerId)) : 0;
  const temporal = Number.isFinite(temporalLayerId) ? Math.max(0, Math.floor(temporalLayerId)) : 0;
  if (spatial >= 2) {
    return 'L2';
  }
  if (spatial >= 1) {
    return 'L1';
  }
  if (temporal >= 1) {
    return 'L1';
  }
  return 'L0';
}

module.exports = {
  RENDITION_PROFILE_HD720,
  RENDITION_PROFILE_FHD1080,
  RENDITION_LADDERS,
  LAYER_IDS,
  AUDIO_LAYER_ID,
  resolveRendition,
  resolveAudioRendition,
  renditionMatchesLadder,
  mapSvcLayersToLayerId
};