const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '../..');
const readmePath = path.join(repoRoot, 'README.md');
const tutorialPath = path.join(repoRoot, 'TUTORIAL.md');
const indexPath = path.join(repoRoot, 'docs/index.html');
const browserCompatPath = path.join(repoRoot, 'docs/browser-compatibility.md');

const troubleshootingAnchor = '#troubleshooting';

describe('docs troubleshooting (#133)', () => {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const tutorial = fs.readFileSync(tutorialPath, 'utf8');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const browserCompat = fs.readFileSync(browserCompatPath, 'utf8');

  test('README documents signaling, recovery phrase, and hard refresh', () => {
    expect(readme).toContain('## Troubleshooting');
    expect(readme).toContain('### Signaling server unreachable');
    expect(readme).toContain('### Recovery phrase');
    expect(readme).toContain('### Hard refresh after local rebuilds');

    expect(readme).toContain('createPeerJSNetworkAdapter');
    expect(readme).toContain('PeerJSNetworkAdapter');
    expect(readme).toContain('wss://dechess-org-peerjs.vercel.app/peerjs?key=peerjs');
    expect(readme).toContain('wss://0.peerjs.com/peerjs?key=peerjs');
    expect(readme).toContain('startAttempts');
    expect(readme).toContain('startRetryDelaysMs');
    expect(readme).toContain('connectTimeoutMs');
    expect(readme).toContain('Unable to connect PeerJS network adapter to ${url}');
    expect(readme).toContain('unavailable-id');
    expect(readme).toContain('invalid-key');
    expect(readme).toContain('is taken');
    expect(readme).toContain('invalid api key');
    expect(readme).toContain('getConnectionStats()');

    expect(readme).toContain('exportIdentityMnemonic');
    expect(readme).toContain('importIdentityMnemonic');
    expect(readme).toContain('exportIdentityMnemonicEncrypted');
    expect(readme).toContain('importIdentityMnemonicEncrypted');
    expect(readme).toContain('Recovery phrase must contain exactly 48 words');
    expect(readme).toContain('Unknown recovery word:');
    expect(readme).toContain('Invalid recovery phrase checksum');
    expect(readme).toContain('deriveKeyPairFromCredentials');

    expect(readme).toContain('npm run build:chess');
    expect(readme).toContain('npm run docs:build');
  });

  test('TUTORIAL, docs site, and browser compatibility link to README troubleshooting', () => {
    expect(tutorial).toContain(`./README.md${troubleshootingAnchor}`);
    expect(indexHtml).toContain('README.md#troubleshooting');
    expect(browserCompat).toContain('README.md#signaling-server-unreachable');
  });
});