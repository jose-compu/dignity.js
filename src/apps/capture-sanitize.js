const SENSITIVE_KEYS = /password|secret|token|privatekey|signingkey|encryptionkey|apppassword/i;
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Sanitize forwarded log/error payload from sandboxed apps (#106).
 * @param {*} value
 * @param {number} [depth]
 * @returns {*}
 */
function sanitizeCaptureValue(value, depth = 0) {
  if (depth > 4) {
    return '[max-depth]';
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > MAX_MESSAGE_LENGTH
      ? `${value.slice(0, MAX_MESSAGE_LENGTH)}…`
      : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((entry) => sanitizeCaptureValue(entry, depth + 1));
  }

  if (typeof value === 'object') {
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      if (SENSITIVE_KEYS.test(key)) {
        out[key] = '[redacted]';
      } else {
        out[key] = sanitizeCaptureValue(entry, depth + 1);
      }
    }
    return out;
  }

  return String(value).slice(0, MAX_MESSAGE_LENGTH);
}

/**
 * Sanitize a log/error message string.
 * @param {string} message
 * @returns {string}
 */
function sanitizeCaptureMessage(message) {
  if (message === null || message === undefined) {
    return '';
  }
  const text = String(message);
  return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH)}…` : text;
}

module.exports = {
  SENSITIVE_KEYS,
  MAX_MESSAGE_LENGTH,
  sanitizeCaptureValue,
  sanitizeCaptureMessage
};
