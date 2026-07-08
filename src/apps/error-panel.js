const { sanitizeCaptureMessage } = require('./capture-sanitize');

const PANEL_STYLE_ID = 'dignity-app-error-panel-styles';

const DEFAULT_STYLES = `
.dignity-app-panel { font-family: system-ui, sans-serif; font-size: 13px; margin: 0 0 8px; border: 1px solid #ccc; border-radius: 6px; background: #fafafa; }
.dignity-app-panel__toggle { width: 100%; text-align: left; padding: 8px 12px; border: 0; background: transparent; cursor: pointer; font: inherit; }
.dignity-app-panel__toggle--error { color: #a40000; font-weight: 600; }
.dignity-app-panel__body { max-height: 200px; overflow: auto; padding: 0 12px 8px; }
.dignity-app-panel__entry { margin: 4px 0; padding: 6px 8px; border-radius: 4px; background: #fff; border: 1px solid #eee; white-space: pre-wrap; word-break: break-word; }
.dignity-app-panel__entry--error { border-color: #f5c2c7; background: #fff5f5; }
.dignity-app-panel__meta { color: #666; font-size: 11px; }
`;

/**
 * Inject panel styles once into document head.
 * @param {Document} doc
 */
function ensurePanelStyles(doc) {
  if (!doc || doc.getElementById(PANEL_STYLE_ID)) {
    return;
  }
  const style = doc.createElement('style');
  style.id = PANEL_STYLE_ID;
  style.textContent = DEFAULT_STYLES;
  doc.head.appendChild(style);
}

/**
 * Attach expandable error/log panel to a DignityAppHost (#106).
 * @param {import('./host')} host
 * @param {HTMLElement} container - parent; panels inserted before host iframe
 * @param {object} [options]
 * @param {Document} [options.document]
 * @param {number} [options.maxEntries]
 * @returns {{ destroy: () => void }}
 */
function attachErrorPanel(host, container, options = {}) {
  if (!host || !container) {
    throw new Error('attachErrorPanel requires host and container');
  }

  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  if (!doc) {
    throw new Error('attachErrorPanel requires a DOM document');
  }

  const maxEntries = typeof options.maxEntries === 'number' ? options.maxEntries : 50;
  ensurePanelStyles(doc);

  const errorPanel = doc.createElement('div');
  errorPanel.className = 'dignity-app-panel dignity-app-panel--errors';
  errorPanel.hidden = true;

  const errorToggle = doc.createElement('button');
  errorToggle.type = 'button';
  errorToggle.className = 'dignity-app-panel__toggle dignity-app-panel__toggle--error';
  errorToggle.textContent = 'App errors (0)';
  errorToggle.setAttribute('aria-expanded', 'false');

  const errorBody = doc.createElement('div');
  errorBody.className = 'dignity-app-panel__body';
  errorBody.hidden = true;
  errorPanel.appendChild(errorToggle);
  errorPanel.appendChild(errorBody);

  const logPanel = doc.createElement('div');
  logPanel.className = 'dignity-app-panel dignity-app-panel--logs';

  const logToggle = doc.createElement('button');
  logToggle.type = 'button';
  logToggle.className = 'dignity-app-panel__toggle';
  logToggle.textContent = 'App log (0)';
  logToggle.setAttribute('aria-expanded', 'false');

  const logBody = doc.createElement('div');
  logBody.className = 'dignity-app-panel__body';
  logBody.hidden = true;
  logPanel.appendChild(logToggle);
  logPanel.appendChild(logBody);

  container.insertBefore(errorPanel, container.firstChild);
  container.insertBefore(logPanel, container.firstChild);

  const errors = [];
  const logs = [];

  function formatEntry(payload, isError) {
    const entry = doc.createElement('div');
    entry.className = `dignity-app-panel__entry${isError ? ' dignity-app-panel__entry--error' : ''}`;
    const meta = doc.createElement('div');
    meta.className = 'dignity-app-panel__meta';
    meta.textContent = payload.type || (isError ? 'error' : 'log');
    const text = doc.createElement('div');
    const message = sanitizeCaptureMessage(payload.message || payload.reason || JSON.stringify(payload));
    text.textContent = message;
    entry.appendChild(meta);
    entry.appendChild(text);
    return entry;
  }

  function pushEntry(list, bodyEl, toggleEl, label, payload, isError) {
    list.push(payload);
    while (list.length > maxEntries) {
      list.shift();
    }
    bodyEl.appendChild(formatEntry(payload, isError));
    toggleEl.textContent = `${label} (${list.length})`;
  }

  function expandPanel(panel, toggle, body) {
    panel.hidden = false;
    body.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }

  errorToggle.addEventListener('click', () => {
    const open = errorBody.hidden;
    errorBody.hidden = !open;
    errorToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  logToggle.addEventListener('click', () => {
    const open = logBody.hidden;
    logBody.hidden = !open;
    logToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  const onApplog = (payload) => {
    pushEntry(logs, logBody, logToggle, 'App log', payload, false);
  };

  const onApperror = (payload) => {
    pushEntry(errors, errorBody, errorToggle, 'App errors', payload, true);
    expandPanel(errorPanel, errorToggle, errorBody);
  };

  const onApprpcerror = (payload) => {
    pushEntry(errors, errorBody, errorToggle, 'App errors', {
      type: 'rpc-error',
      message: payload.message || payload.code,
      code: payload.code
    }, true);
    expandPanel(errorPanel, errorToggle, errorBody);
  };

  host.on('applog', onApplog);
  host.on('apperror', onApperror);
  host.on('apprpcerror', onApprpcerror);

  return {
    destroy() {
      host.off('applog', onApplog);
      host.off('apperror', onApperror);
      host.off('apprpcerror', onApprpcerror);
      if (errorPanel.parentNode) {
        errorPanel.parentNode.removeChild(errorPanel);
      }
      if (logPanel.parentNode) {
        logPanel.parentNode.removeChild(logPanel);
      }
    }
  };
}

module.exports = {
  attachErrorPanel,
  ensurePanelStyles,
  DEFAULT_STYLES
};
