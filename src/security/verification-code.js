const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { stableStringify } = require('./message-security-service');
const { hashReflectiveLogic } = require('./reflective-logic');

const COMPATIBILITY_POLICIES = Object.freeze([
  'strict',
  'backward-compatible',
  'patch-only',
  'minor-and-patch',
  'advisory'
]);

const DEFAULT_COMPATIBILITY_POLICY = 'advisory';
const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;

/**
 * Normalize verification code input to a canonical string for hashing.
 * @param {Function|string|object} codeOrRules
 * @param {object} [options]
 * @param {boolean} [options.reflective]
 * @returns {string}
 */
function normalizeVerificationCode(codeOrRules, options = {}) {
  if (codeOrRules === null || codeOrRules === undefined) {
    throw new Error('verification code is required');
  }

  if (options.reflective === true) {
    if (typeof codeOrRules === 'function' || typeof codeOrRules === 'object') {
      return stableStringify(hashReflectiveLogic(codeOrRules, options).fingerprintList);
    }
  }

  if (typeof codeOrRules === 'function') {
    return codeOrRules.toString().replace(/\s+/g, ' ').trim();
  }

  if (typeof codeOrRules === 'string') {
    return codeOrRules.replace(/\s+/g, ' ').trim();
  }

  if (typeof codeOrRules === 'object') {
    return stableStringify(codeOrRules);
  }

  return String(codeOrRules);
}

/**
 * Hash verification code + policy into a stable sha512 digest (#115, #117).
 * @param {Function|string|object} codeOrRules
 * @param {object} [options]
 * @param {string} [options.policy]
 * @param {boolean} [options.reflective]
 * @returns {string}
 */
function hashVerificationCode(codeOrRules, options = {}) {
  const policy = options.policy || DEFAULT_COMPATIBILITY_POLICY;
  if (!COMPATIBILITY_POLICIES.includes(policy)) {
    throw new Error(`invalid compatibility policy: ${policy}`);
  }

  if (options.reflective === true && (typeof codeOrRules === 'function' || typeof codeOrRules === 'object')) {
    return hashReflectiveLogic(codeOrRules, options).hash;
  }

  const canonical = stableStringify({
    code: normalizeVerificationCode(codeOrRules, options),
    policy
  });
  const bytes = naclUtil.decodeUTF8(canonical);
  const hash = nacl.hash(bytes);
  const hex = Array.from(hash, (b) => b.toString(16).padStart(2, '0')).join('');
  return `sha512:${hex}`;
}

/**
 * Parse and validate semver string (#116).
 * @param {string} version
 * @returns {{ major: number, minor: number, patch: number, prerelease: string|null, build: string|null }}
 */
function parseSemver(version) {
  if (typeof version !== 'string' || !version.trim()) {
    throw new Error('verificationVersion must be a non-empty semver string');
  }

  const match = version.trim().match(SEMVER_PATTERN);
  if (!match) {
    throw new Error(`invalid semver: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] || null,
    build: match[5] || null
  };
}

/**
 * Compare semver: -1 if a < b, 0 if equal, 1 if a > b (ignores prerelease/build).
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function compareSemver(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);

  if (left.major !== right.major) {
    return left.major > right.major ? 1 : -1;
  }
  if (left.minor !== right.minor) {
    return left.minor > right.minor ? 1 : -1;
  }
  if (left.patch !== right.patch) {
    return left.patch > right.patch ? 1 : -1;
  }
  return 0;
}

/**
 * Build a verification registry entry from registration options.
 * @param {object} options
 * @returns {object}
 */
function buildPublisherVerificationKey(publisherId, collectionName) {
  if (!publisherId || !collectionName) {
    throw new Error('publisherId and collectionName are required');
  }
  return `${publisherId}:${collectionName}`;
}

function buildVerificationEntry({
  code,
  version = null,
  policy = DEFAULT_COMPATIBILITY_POLICY,
  publisherId = null,
  dappId = null,
  reflective = false,
  stripComments = true,
  collapseWhitespace = true,
  allowNative = false
}) {
  const normalizedPolicy = policy || DEFAULT_COMPATIBILITY_POLICY;
  if (!COMPATIBILITY_POLICIES.includes(normalizedPolicy)) {
    throw new Error(`invalid compatibility policy: ${normalizedPolicy}`);
  }

  const hashOptions = {
    policy: normalizedPolicy,
    reflective,
    stripComments,
    collapseWhitespace,
    allowNative
  };
  const hash = hashVerificationCode(code, hashOptions);
  const versionRegistry = new Map();
  let fingerprintList = null;

  if (reflective && (typeof code === 'function' || typeof code === 'object')) {
    fingerprintList = hashReflectiveLogic(code, hashOptions).fingerprintList;
  }

  if (version) {
    parseSemver(version);
    versionRegistry.set(version, hash);
  }

  return {
    code,
    policy: normalizedPolicy,
    hash,
    version: version || null,
    publisherId: publisherId || null,
    dappId: dappId || null,
    reflective: reflective === true,
    fingerprintList,
    versionRegistry
  };
}

/**
 * Evaluate whether remote verification metadata is compatible with local config (#117).
 * @param {object|null} localEntry
 * @param {object} remoteMeta
 * @param {object} [context]
 * @returns {{ action: 'accept'|'reject'|'warn', reason?: string, events?: object[] }}
 */
function evaluateVerificationCompatibility(localEntry, remoteMeta = {}, context = {}) {
  if (!localEntry) {
    return { action: 'accept' };
  }

  const events = [];
  const remoteHash = remoteMeta.verificationHash || null;
  const remoteVersion = remoteMeta.verificationVersion || null;
  const localHash = localEntry.hash;
  const localVersion = localEntry.version;
  const policy = localEntry.policy || DEFAULT_COMPATIBILITY_POLICY;

  if (remoteVersion && localEntry.versionRegistry) {
    const registeredHash = localEntry.versionRegistry.get(remoteVersion);
    if (registeredHash && remoteHash && registeredHash !== remoteHash) {
      events.push({
        type: 'warning',
        payload: {
          type: 'verification-version-spoof',
          collection: context.collection,
          senderId: context.senderId,
          declaredVersion: remoteVersion,
          declaredHash: remoteHash,
          registeredHash
        }
      });
      if (policy !== 'advisory') {
        return {
          action: 'reject',
          reason: 'verification-version-spoof',
          events: events.concat([{
            type: 'policyrejected',
            payload: {
              policy,
              collection: context.collection,
              senderId: context.senderId,
              localVersion,
              remoteVersion,
              localHash,
              remoteHash,
              reason: 'verification-version-spoof'
            }
          }])
        };
      }
    }
  }

  if (!remoteHash) {
    if (policy === 'advisory') {
      events.push({
        type: 'warning',
        payload: {
          type: 'verification-hash-missing',
          collection: context.collection,
          senderId: context.senderId,
          localHash
        }
      });
      return { action: 'accept', events };
    }

    return {
      action: 'reject',
      reason: 'verification-hash-missing',
      events: events.concat([{
        type: 'policyrejected',
        payload: {
          policy,
          collection: context.collection,
          senderId: context.senderId,
          localVersion,
          remoteVersion,
          localHash,
          remoteHash: null,
          reason: 'verification-hash-missing'
        }
      }])
    };
  }

  if (remoteHash === localHash) {
    return { action: 'accept', events };
  }

  events.push({
    type: 'verificationmismatch',
    payload: {
      collection: context.collection,
      senderId: context.senderId,
      localHash,
      remoteHash,
      localVersion,
      remoteVersion
    }
  });

  if (policy === 'advisory') {
    events.push({
      type: 'warning',
      payload: {
        type: 'verification-hash-mismatch',
        collection: context.collection,
        senderId: context.senderId,
        localHash,
        remoteHash
      }
    });
    return { action: 'accept', events };
  }

  if (policy === 'strict') {
    return {
      action: 'reject',
      reason: 'strict-hash-mismatch',
      events: events.concat([{
        type: 'policyrejected',
        payload: {
          policy,
          collection: context.collection,
          senderId: context.senderId,
          localVersion,
          remoteVersion,
          localHash,
          remoteHash,
          reason: 'strict-hash-mismatch'
        }
      }])
    };
  }

  if (!localVersion || !remoteVersion) {
    return {
      action: 'reject',
      reason: 'version-required-for-policy',
      events: events.concat([{
        type: 'policyrejected',
        payload: {
          policy,
          collection: context.collection,
          senderId: context.senderId,
          localVersion,
          remoteVersion,
          localHash,
          remoteHash,
          reason: 'version-required-for-policy'
        }
      }])
    };
  }

  const localParsed = parseSemver(localVersion);
  const remoteParsed = parseSemver(remoteVersion);
  let compatible = false;

  if (policy === 'backward-compatible') {
    compatible = compareSemver(localVersion, remoteVersion) >= 0;
  } else if (policy === 'patch-only') {
    compatible = localParsed.major === remoteParsed.major
      && localParsed.minor === remoteParsed.minor;
  } else if (policy === 'minor-and-patch') {
    compatible = localParsed.major === remoteParsed.major;
  }

  if (compatible) {
    return { action: 'accept', events };
  }

  return {
    action: 'reject',
    reason: 'policy-version-incompatible',
    events: events.concat([{
      type: 'policyrejected',
      payload: {
        policy,
        collection: context.collection,
        senderId: context.senderId,
        localVersion,
        remoteVersion,
        localHash,
        remoteHash,
        reason: 'policy-version-incompatible'
      }
    }])
  };
}

/**
 * Collect verification versions for presence metadata (#116).
 * @param {Map<string, object>} registry
 * @returns {object}
 */
function buildVerificationPresenceMetadata(registry) {
  const out = {};
  if (!registry || registry.size === 0) {
    return out;
  }

  for (const [collection, entry] of registry.entries()) {
    if (entry.version) {
      out[collection] = {
        verificationVersion: entry.version,
        verificationHash: entry.hash
      };
    } else if (entry.hash) {
      out[collection] = { verificationHash: entry.hash };
    }
    if (entry.reflective && Array.isArray(entry.fingerprintList) && entry.fingerprintList.length > 0) {
      out[collection].reflective = true;
      out[collection].logicFingerprints = entry.fingerprintList.map((item) => item.path);
    }
  }
  return out;
}

/**
 * Presence metadata for publisher-scoped official dapp versions (#123 decentralized trust).
 * @param {Map<string, object>} publisherRegistry keyed by publisherId:collection
 * @returns {object}
 */
function buildPublisherVerificationPresenceMetadata(publisherRegistry) {
  const out = {};
  if (!publisherRegistry || publisherRegistry.size === 0) {
    return out;
  }

  for (const [key, entry] of publisherRegistry.entries()) {
    const [publisherId, collection] = key.split(':');
    if (!publisherId || !collection || !entry) {
      continue;
    }
    if (!out[publisherId]) {
      out[publisherId] = {};
    }
    const meta = {
      verificationHash: entry.hash
    };
    if (entry.version) {
      meta.verificationVersion = entry.version;
    }
    if (entry.dappId) {
      meta.dappId = entry.dappId;
    }
    if (entry.reflective) {
      meta.reflective = true;
    }
    out[publisherId][collection] = meta;
  }
  return out;
}

module.exports = {
  COMPATIBILITY_POLICIES,
  DEFAULT_COMPATIBILITY_POLICY,
  normalizeVerificationCode,
  hashVerificationCode,
  parseSemver,
  compareSemver,
  buildPublisherVerificationKey,
  buildVerificationEntry,
  evaluateVerificationCompatibility,
  buildVerificationPresenceMetadata,
  buildPublisherVerificationPresenceMetadata,
  hashReflectiveLogic
};
