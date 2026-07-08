import { PLAYGROUND_DEMOS } from './playground-demos.js';

const dignityPromise = import('./dignity.esm.js').then((mod) => mod.default || mod);

const els = {
  featureSelect: document.getElementById('feature-select'),
  featureDesc: document.getElementById('feature-desc'),
  editor: document.getElementById('code-editor'),
  highlightCode: document.getElementById('code-highlight'),
  highlightPre: document.querySelector('.playground-editor-highlight'),
  runBtn: document.getElementById('run-btn'),
  resetBtn: document.getElementById('reset-btn'),
  clearBtn: document.getElementById('clear-btn'),
  output: document.getElementById('output'),
  status: document.getElementById('run-status')
};

let highlightTimer = null;

let activeCleanup = null;
let running = false;

function getDemoById(id) {
  return PLAYGROUND_DEMOS.find((demo) => demo.id === id) || PLAYGROUND_DEMOS[0];
}

function populateFeatureSelect() {
  const groups = new Map();
  for (const demo of PLAYGROUND_DEMOS) {
    const key = demo.group || 'core';
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(demo);
  }

  const labels = {
    core: 'Core',
    v013: 'v0.13 verification',
    patterns: 'Browser patterns',
    apps: 'Dignity Apps'
  };

  const order = ['core', 'v013', 'patterns', 'apps'];
  const seen = new Set(order);
  for (const key of groups.keys()) {
    if (!seen.has(key)) {
      order.push(key);
    }
  }

  els.featureSelect.innerHTML = order
    .filter((key) => groups.has(key))
    .map((key) => {
      const options = groups.get(key).map(
        (demo) => `<option value="${demo.id}">${demo.title}</option>`
      ).join('');
      return `<optgroup label="${labels[key] || key}">${options}</optgroup>`;
    })
    .join('');
}

function syncEditorScroll() {
  if (!els.highlightPre) {
    return;
  }
  els.highlightPre.scrollTop = els.editor.scrollTop;
  els.highlightPre.scrollLeft = els.editor.scrollLeft;
}

function updateHighlight() {
  if (!els.highlightCode || typeof hljs === 'undefined') {
    return;
  }

  const source = els.editor.value;
  els.highlightCode.textContent = source.endsWith('\n') ? source : `${source}\n`;

  if (typeof hljs.highlight === 'function') {
    const { value } = hljs.highlight(source, { language: 'javascript' });
    els.highlightCode.innerHTML = value;
    els.highlightCode.classList.add('hljs', 'language-javascript');
  } else {
    hljs.highlightElement(els.highlightCode);
  }

  syncEditorScroll();
}

function scheduleHighlight() {
  if (highlightTimer) {
    cancelAnimationFrame(highlightTimer);
  }
  highlightTimer = requestAnimationFrame(() => {
    highlightTimer = null;
    updateHighlight();
  });
}

function loadDemo(demo, { pushHash = true } = {}) {
  els.featureSelect.value = demo.id;
  els.featureDesc.textContent = demo.description;
  els.editor.value = demo.code;
  scheduleHighlight();
  if (pushHash) {
    history.replaceState(null, '', `#${demo.id}`);
  }
}

function appendOutputLine(line, className = '') {
  const row = document.createElement('div');
  row.className = `playground-output__line${className ? ` ${className}` : ''}`;
  row.textContent = line;
  els.output.appendChild(row);
  els.output.scrollTop = els.output.scrollHeight;
}

function clearOutput() {
  els.output.innerHTML = '';
}

function setStatus(text, kind = '') {
  els.status.textContent = text;
  els.status.className = `playground-toolbar__status${kind ? ` is-${kind}` : ''}`;
}

function createHelpers() {
  const tracked = [];
  const cleanupFns = [];

  return {
    fastSecurity(overrides = {}) {
      return {
        appPassword: 'playground-app-password',
        powEnabled: false,
        signingEnabled: false,
        encryptionEnabled: false,
        ...overrides
      };
    },
    sleep(ms = 30) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    track(...nodes) {
      tracked.push(...nodes);
    },
    onCleanup(fn) {
      cleanupFns.push(fn);
    },
    async cleanupAll() {
      for (const fn of cleanupFns.splice(0)) {
        try {
          await fn();
        } catch (_ignored) {
          // ignore cleanup errors
        }
      }
      for (const node of tracked.splice(0)) {
        try {
          if (node && typeof node.stop === 'function') {
            await node.stop();
          }
        } catch (_ignored) {
          // ignore stop errors
        }
      }
    }
  };
}

async function runCleanup() {
  if (typeof activeCleanup === 'function') {
    await activeCleanup();
    activeCleanup = null;
  }
}

async function runCode() {
  if (running) {
    return;
  }

  running = true;
  els.runBtn.disabled = true;
  clearOutput();
  setStatus('Running…', 'running');

  await runCleanup();

  const helpers = createHelpers();
  activeCleanup = () => helpers.cleanupAll();

  const log = (...args) => {
    const line = args
      .map((value) => {
        if (typeof value === 'string') {
          return value;
        }
        try {
          return JSON.stringify(value);
        } catch (_ignored) {
          return String(value);
        }
      })
      .join(' ');
    appendOutputLine(line);
  };

  try {
    const dignity = await dignityPromise;
    const userCode = els.editor.value;
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const runner = new AsyncFunction('dignity', 'log', 'helpers', `"use strict";\n${userCode}`);
    await runner(dignity, log, helpers);
    setStatus('Done', 'ok');
  } catch (error) {
    appendOutputLine(String(error?.stack || error?.message || error), 'is-error');
    setStatus('Error', 'error');
  } finally {
    await runCleanup();
    running = false;
    els.runBtn.disabled = false;
  }
}

function initEditor() {
  els.editor.addEventListener('input', scheduleHighlight);
  els.editor.addEventListener('scroll', syncEditorScroll);

  els.editor.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') {
      return;
    }
    event.preventDefault();
    const { selectionStart, selectionEnd, value } = els.editor;
    const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    els.editor.value = next;
    els.editor.selectionStart = els.editor.selectionEnd = selectionStart + 2;
    scheduleHighlight();
  });
}

function initFromHash() {
  const id = window.location.hash.replace('#', '');
  const demo = id ? getDemoById(id) : PLAYGROUND_DEMOS[0];
  loadDemo(demo, { pushHash: Boolean(id) });
}

populateFeatureSelect();
initFromHash();
initEditor();
updateHighlight();

els.featureSelect.addEventListener('change', () => {
  loadDemo(getDemoById(els.featureSelect.value));
});

els.runBtn.addEventListener('click', () => {
  runCode();
});

els.resetBtn.addEventListener('click', () => {
  loadDemo(getDemoById(els.featureSelect.value), { pushHash: false });
  clearOutput();
  setStatus('Reset to example');
});

els.clearBtn.addEventListener('click', () => {
  clearOutput();
  setStatus('');
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.replace('#', '');
  if (id) {
    loadDemo(getDemoById(id), { pushHash: false });
  }
});
