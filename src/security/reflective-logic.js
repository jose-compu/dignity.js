const acorn = require('acorn');
const { generate } = require('astring');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const { stableStringify } = require('./message-security-service');

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const PARSE_OPTIONS = { ecmaVersion: 'latest', sourceType: 'script' };
const GENERATE_OPTIONS = { indent: '', lineEnd: '' };

/**
 * Parse a function.toString() fragment into an ESTree function node.
 * @param {string} source
 * @returns {import('acorn').Node|null}
 */
function parseFunctionSource(source) {
  const trimmed = String(source).trim();
  if (!trimmed) {
    return null;
  }

  const candidates = [];
  if (/^(async\s+)?function\b/.test(trimmed)) {
    candidates.push(trimmed, `(${trimmed})`);
  } else if (/^[a-zA-Z_$][\w$]*\s*\(/.test(trimmed)) {
    candidates.push(`({${trimmed}})`);
  } else {
    candidates.push(`const __fn = ${trimmed};`, trimmed, `(${trimmed})`);
  }

  for (const candidate of candidates) {
    try {
      const program = acorn.parse(candidate, PARSE_OPTIONS);
      const fn = extractFunctionNode(program);
      if (fn) {
        return fn;
      }
    } catch (_) {
      // try next parse wrapper
    }
  }

  return null;
}

/**
 * @param {import('acorn').Node} program
 * @returns {import('acorn').Node|null}
 */
function extractFunctionNode(program) {
  const queue = [program];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || typeof node !== 'object') {
      continue;
    }

    if (
      node.type === 'FunctionDeclaration'
      || node.type === 'FunctionExpression'
      || node.type === 'ArrowFunctionExpression'
    ) {
      return node;
    }

    if (node.type === 'Program' || node.type === 'BlockStatement') {
      queue.push(...(node.body || []));
      continue;
    }

    if (node.type === 'ExpressionStatement') {
      queue.push(node.expression);
      continue;
    }

    if (node.type === 'AssignmentExpression') {
      queue.push(node.right);
      continue;
    }

    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations) {
        queue.push(decl.init);
      }
      continue;
    }

    if (node.type === 'ObjectExpression') {
      for (const prop of node.properties) {
        if (prop.type === 'MethodDefinition') {
          return prop.value;
        }
        if (prop.type === 'Property') {
          queue.push(prop.value);
        }
      }
    }
  }

  return null;
}

/**
 * Serialize a function AST node to a stable, whitespace-free canonical form.
 * Function names are omitted — graph path identifies the slot (#123).
 * @param {import('acorn').Node} node
 * @returns {string}
 */
function canonicalizeFunctionNode(node) {
  if (node.type === 'FunctionDeclaration') {
    return generate({
      ...node,
      type: 'FunctionExpression',
      id: null
    }, GENERATE_OPTIONS);
  }

  if (node.type === 'FunctionExpression' && node.id) {
    return generate({
      ...node,
      id: null
    }, GENERATE_OPTIONS);
  }

  return generate(node, GENERATE_OPTIONS);
}

/**
 * Normalize JavaScript function source for stable hashing (#123).
 * Prefers AST pretty-print canonicalization; falls back to comment/whitespace strip.
 * @param {string} source
 * @param {object} [options]
 * @param {boolean} [options.stripComments=true]
 * @param {boolean} [options.collapseWhitespace=true]
 * @param {boolean} [options.astCanonicalize=true]
 * @returns {string}
 */
function normalizeFunctionSource(source, options = {}) {
  const astCanonicalize = options.astCanonicalize !== false;

  if (astCanonicalize) {
    const fnNode = parseFunctionSource(source);
    if (fnNode) {
      return canonicalizeFunctionNode(fnNode);
    }
  }

  const stripComments = options.stripComments !== false;
  const collapseWhitespace = options.collapseWhitespace !== false;
  let normalized = String(source);

  if (stripComments) {
    normalized = normalized
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
  }

  if (collapseWhitespace) {
    normalized = normalized.replace(/\s+/g, ' ').trim();
  }

  return normalized;
}

/**
 * @param {Function} fn
 * @param {object} options
 * @returns {string}
 */
function extractFunctionSource(fn, options = {}) {
  const source = fn.toString();
  if (!options.allowNative && /\[native code\]/.test(source)) {
    throw new Error('native functions cannot be fingerprinted reflectively');
  }
  return normalizeFunctionSource(source, options);
}

/**
 * Walk a value graph and collect reflective fingerprints (#123).
 * @param {*} input
 * @param {object} [options]
 * @param {string} [options.path='$']
 * @param {Map<string, string>} [options.fingerprints]
 * @param {WeakSet<object>} [options.seen]
 * @param {boolean} [options.allowNative=false]
 * @param {boolean} [options.stripComments=true]
 * @param {boolean} [options.collapseWhitespace=true]
 * @param {boolean} [options.astCanonicalize=true]
 * @returns {{ canonical: *, fingerprints: Map<string, string> }}
 */
function collectReflectiveFingerprints(input, options = {}) {
  const fingerprints = options.fingerprints || new Map();
  const seen = options.seen || new WeakSet();
  const path = options.path || '$';
  const walkOptions = {
    allowNative: options.allowNative === true,
    stripComments: options.stripComments !== false,
    collapseWhitespace: options.collapseWhitespace !== false,
    astCanonicalize: options.astCanonicalize !== false,
    fingerprints,
    seen
  };

  function walk(value, currentPath) {
    if (value === null || value === undefined) {
      return value;
    }

    const valueType = typeof value;
    if (valueType === 'function') {
      const normalized = extractFunctionSource(value, walkOptions);
      fingerprints.set(currentPath, normalized);
      return { __reflectiveFunction__: currentPath };
    }

    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      return value;
    }

    if (valueType !== 'object') {
      return String(value);
    }

    if (seen.has(value)) {
      return { __reflectiveRef__: currentPath };
    }
    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((item, index) => walk(item, `${currentPath}[${index}]`));
    }

    const out = {};
    const keys = Reflect.ownKeys(value)
      .map((key) => String(key))
      .filter((key) => !DANGEROUS_KEYS.has(key))
      .sort();

    for (const key of keys) {
      out[key] = walk(value[key], `${currentPath}.${key}`);
    }
    return out;
  }

  return {
    canonical: walk(input, path),
    fingerprints
  };
}

/**
 * Hash reflective business logic (functions embedded in object graphs) (#123).
 * @param {*} input
 * @param {object} [options]
 * @param {string} [options.policy]
 * @param {boolean} [options.allowNative=false]
 * @param {boolean} [options.stripComments=true]
 * @param {boolean} [options.collapseWhitespace=true]
 * @param {boolean} [options.astCanonicalize=true]
 * @returns {{ hash: string, fingerprints: Map<string, string>, fingerprintList: Array<{path: string, hash: string}> }}
 */
function hashReflectiveLogic(input, options = {}) {
  const { canonical, fingerprints } = collectReflectiveFingerprints(input, options);
  const fingerprintEntries = [...fingerprints.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([path, source]) => ({
      path,
      source,
      hash: digestSha512(source)
    }));

  const payload = stableStringify({
    canonical,
    fingerprints: fingerprintEntries.map((entry) => ({
      path: entry.path,
      source: entry.source
    })),
    policy: options.policy || null
  });

  return {
    hash: digestSha512(payload),
    fingerprints,
    fingerprintList: fingerprintEntries.map(({ path, hash }) => ({ path, hash }))
  };
}

function digestSha512(value) {
  const bytes = naclUtil.decodeUTF8(String(value));
  const hash = nacl.hash(bytes);
  const hex = Array.from(hash, (b) => b.toString(16).padStart(2, '0')).join('');
  return `sha512:${hex}`;
}

module.exports = {
  parseFunctionSource,
  canonicalizeFunctionNode,
  normalizeFunctionSource,
  extractFunctionSource,
  collectReflectiveFingerprints,
  hashReflectiveLogic,
  digestSha512
};
