/**
 * Build Content-Security-Policy for sandboxed Dignity Apps (issue #102).
 * @param {object} manifest - validated app manifest
 * @returns {string} CSP directive string for meta http-equiv
 */
function buildAppCsp(manifest) {
  const origins = Array.isArray(manifest?.allowedCspOrigins)
    ? manifest.allowedCspOrigins
    : [];

  const connectSrc = ["'none'", ...origins].join(' ');

  return [
    "default-src 'none'",
    "script-src 'unsafe-inline'",
    "style-src 'unsafe-inline'",
    'img-src data: blob:',
    `connect-src ${connectSrc}`,
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'"
  ].join('; ');
}

/**
 * Escape CSP content for use inside a double-quoted HTML attribute.
 * @param {string} csp
 * @returns {string}
 */
function escapeCspForHtmlAttribute(csp) {
  return String(csp)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

/**
 * Inject immutable CSP meta tag at the start of <head>.
 * @param {string} html
 * @param {string} cspContent
 * @returns {string}
 */
function injectCspMeta(html, cspContent) {
  const escaped = escapeCspForHtmlAttribute(cspContent);
  const meta = `<meta http-equiv="Content-Security-Policy" content="${escaped}">`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}\n  ${meta}`);
  }

  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html[^>]*>/i, (match) => `${match}\n<head>\n  ${meta}\n</head>`);
  }

  return `<!DOCTYPE html><html><head>\n  ${meta}\n</head><body>${html}</body></html>`;
}

/**
 * Inject CSP violation reporter script (forwards to parent via postMessage fallback).
 * @param {string} html
 * @returns {string}
 */
function injectCspViolationReporter(html) {
  const script = `<script>
document.addEventListener('securitypolicyviolation', function(e) {
  try {
    parent.postMessage({
      type: 'dignity-app-csp-violation',
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy
    }, '*');
  } catch (err) {}
});
</script>`;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `  ${script}\n</head>`);
  }

  return `${script}${html}`;
}

/**
 * Prepare sandboxed app HTML with CSP and violation reporter.
 * @param {string} appHtml
 * @param {object} manifest
 * @returns {string}
 */
function prepareSandboxedAppHtml(appHtml, manifest) {
  const csp = buildAppCsp(manifest);
  let html = injectCspMeta(appHtml, csp);
  html = injectCspViolationReporter(html);
  return html;
}

module.exports = {
  buildAppCsp,
  escapeCspForHtmlAttribute,
  injectCspMeta,
  injectCspViolationReporter,
  prepareSandboxedAppHtml
};
