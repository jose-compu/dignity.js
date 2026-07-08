const {
  buildAppCsp,
  escapeCspForHtmlAttribute,
  injectCspMeta,
  injectCspViolationReporter,
  prepareSandboxedAppHtml
} = require('../../src/apps/csp');

describe('Dignity App CSP', () => {
  const manifest = {
    allowedCspOrigins: ['https://cdn.example.com']
  };

  test('buildAppCsp blocks default and allows manifest origins', () => {
    const csp = buildAppCsp(manifest);
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("script-src 'unsafe-inline'");
    expect(csp).toContain('img-src data: blob:');
    expect(csp).toContain('https://cdn.example.com');
    expect(csp).not.toContain('evil.example');
    expect(csp).not.toContain('localhost');
  });

  test('buildAppCsp uses connect-src none when no origins', () => {
    const csp = buildAppCsp({ allowedCspOrigins: [] });
    expect(csp).toContain("connect-src 'none'");
  });

  test('injectCspMeta prepends meta to head', () => {
    const html = '<html><head><title>x</title></head><body></body></html>';
    const out = injectCspMeta(html, "default-src 'none'");
    expect(out).toMatch(/<head[^>]*>\s*<meta http-equiv="Content-Security-Policy"/);
    expect(out.indexOf('<meta http-equiv="Content-Security-Policy"')).toBeLessThan(out.indexOf('<title>'));
  });

  test('prepareSandboxedAppHtml injects CSP and violation reporter', () => {
    const out = prepareSandboxedAppHtml('<html><head></head><body>hi</body></html>', manifest);
    expect(out).toContain('Content-Security-Policy');
    expect(out).toContain('securitypolicyviolation');
    expect(out).toContain('https://cdn.example.com');
  });

  test('injectCspMeta creates head when missing', () => {
    const out = injectCspMeta('<html><body>hi</body></html>', "default-src 'none'");
    expect(out).toContain('<meta http-equiv="Content-Security-Policy"');
    expect(out).toContain('<head>');
  });

  test('injectCspMeta wraps fragment without html tag', () => {
    const out = injectCspMeta('<p>fragment</p>', "default-src 'none'");
    expect(out).toContain('<!DOCTYPE html>');
    expect(out).toContain('<p>fragment</p>');
    expect(out).toContain('Content-Security-Policy');
  });

  test('escapeCspForHtmlAttribute escapes quotes and ampersands', () => {
    expect(escapeCspForHtmlAttribute('a & b "c"')).toBe('a &amp; b &quot;c&quot;');
  });

  test('buildAppCsp treats non-array origins as empty', () => {
    const csp = buildAppCsp({ allowedCspOrigins: null });
    expect(csp).toContain("connect-src 'none'");
  });

  test('injectCspViolationReporter prepends when head is missing', () => {
    const out = injectCspViolationReporter('<body>hi</body>');
    expect(out).toContain('securitypolicyviolation');
    expect(out.startsWith('<script>')).toBe(true);
  });
});
