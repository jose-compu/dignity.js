/**
 * Experimental live-streaming access modes (design skeleton only; no media transport).
 * @experimental
 */

const STREAM_ACCESS_MODES = Object.freeze({
  PRIVATE_SINGLE: 'private-single',
  PRIVATE_LIST: 'private-list',
  PUBLIC: 'public',
  COMBINED: 'combined'
});

const KNOWN_MODES = new Set(Object.values(STREAM_ACCESS_MODES));

/**
 * Normalize private recipient identity ids.
 * @param {unknown} recipients
 * @returns {string[]}
 */
function normalizePrivateRecipients(recipients) {
  if (recipients == null) {
    return [];
  }
  if (!Array.isArray(recipients)) {
    throw new TypeError('privateRecipients must be an array of identity ids');
  }
  const out = [];
  const seen = new Set();
  for (const id of recipients) {
    if (typeof id !== 'string' || id.trim() === '') {
      throw new TypeError('each private recipient must be a non-empty string identity id');
    }
    const trimmed = id.trim();
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      out.push(trimmed);
    }
  }
  return out;
}

/**
 * Validate access-mode invariants for a stream session config.
 * @param {string} mode
 * @param {{ privateRecipients?: string[] }} [config]
 */
function validateStreamAccessConfig(mode, config = {}) {
  if (!KNOWN_MODES.has(mode)) {
    throw new Error(`Unknown stream access mode: ${mode}`);
  }
  const recipients = normalizePrivateRecipients(config.privateRecipients);

  switch (mode) {
    case STREAM_ACCESS_MODES.PRIVATE_SINGLE:
      if (recipients.length !== 1) {
        throw new Error('private-single access mode requires exactly one private recipient');
      }
      break;
    case STREAM_ACCESS_MODES.PRIVATE_LIST:
      if (recipients.length < 1) {
        throw new Error('private-list access mode requires one or more private recipients');
      }
      break;
    case STREAM_ACCESS_MODES.PUBLIC:
      if (recipients.length !== 0) {
        throw new Error('public access mode must not include private recipients');
      }
      break;
    case STREAM_ACCESS_MODES.COMBINED:
      if (recipients.length < 1) {
        throw new Error('combined access mode requires at least one private recipient alongside the public feed');
      }
      break;
    default:
      break;
  }

  return recipients;
}

module.exports = {
  STREAM_ACCESS_MODES,
  normalizePrivateRecipients,
  validateStreamAccessConfig
};