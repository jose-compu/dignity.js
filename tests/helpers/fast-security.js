/**
 * Fast defaults for in-memory mesh tests.
 * PoW, signing, and encryption are covered in message-security-service.test.js.
 */
function fastTestSecurity(overrides = {}) {
  return {
    appPassword: 'test-app-password',
    powEnabled: false,
    signingEnabled: false,
    encryptionEnabled: false,
    ...overrides
  };
}

function fastWaitFor(condition, timeoutMs = 2000, intervalMs = 10) {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (condition()) {
        resolve(true);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

function fastSleep(ms = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  fastTestSecurity,
  fastWaitFor,
  fastSleep
};
