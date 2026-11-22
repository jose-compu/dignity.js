/**
 * Browser console diagnostics. Off unless this origin opts in.
 *
 * localStorage.dignityDebug = '1'
 * or setDignityDebugEnabled(true)
 */

const STORAGE_KEY = 'dignityDebug';

function isDignityDebugEnabled() {
  if (typeof localStorage === 'undefined') {
    return false;
  }
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === '1' || value === 'true';
  } catch {
    return false;
  }
}

function setDignityDebugEnabled(enabled) {
  const on = Boolean(enabled);
  if (typeof localStorage === 'undefined') {
    return on;
  }
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  } catch {
    // Private mode can reject storage writes.
  }
  return on;
}

module.exports = {
  isDignityDebugEnabled,
  setDignityDebugEnabled
};
