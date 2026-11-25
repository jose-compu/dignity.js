/**
 * Receiver transport stats report (TWCC-style fields, application layer).
 * @experimental
 */

/**
 * @typedef {Object} ReceiverReport
 * @property {string} sessionId
 * @property {string} viewerId
 * @property {string} layerId
 * @property {number} timestampMs
 * @property {number} intervalMs
 * @property {number} bytesReceived
 * @property {number} packetsReceived
 * @property {number} packetsLost
 * @property {number} interarrivalDelayMs
 */

/**
 * @param {Object} fields
 * @returns {ReceiverReport}
 */
function createReceiverReport(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new TypeError('fields must be an object');
  }
  const requiredStrings = ['sessionId', 'viewerId', 'layerId'];
  for (const key of requiredStrings) {
    if (typeof fields[key] !== 'string' || fields[key].trim() === '') {
      throw new TypeError(`${key} must be a non-empty string`);
    }
  }
  const requiredNumbers = [
    'timestampMs',
    'intervalMs',
    'bytesReceived',
    'packetsReceived',
    'packetsLost',
    'interarrivalDelayMs'
  ];
  for (const key of requiredNumbers) {
    if (typeof fields[key] !== 'number' || !Number.isFinite(fields[key])) {
      throw new TypeError(`${key} must be a finite number`);
    }
  }
  if (fields.intervalMs <= 0) {
    throw new RangeError('intervalMs must be positive');
  }
  if (fields.bytesReceived < 0 || fields.packetsReceived < 0 || fields.packetsLost < 0) {
    throw new RangeError('byte and packet counts must be non-negative');
  }

  return Object.freeze({
    sessionId: fields.sessionId.trim(),
    viewerId: fields.viewerId.trim(),
    layerId: fields.layerId.trim(),
    timestampMs: fields.timestampMs,
    intervalMs: fields.intervalMs,
    bytesReceived: fields.bytesReceived,
    packetsReceived: fields.packetsReceived,
    packetsLost: fields.packetsLost,
    interarrivalDelayMs: fields.interarrivalDelayMs
  });
}

module.exports = {
  createReceiverReport
};