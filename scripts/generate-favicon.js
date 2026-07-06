const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svg = path.join(root, 'docs/assets/favicon.svg');
const outputs = [
  path.join(root, 'docs/favicon.ico'),
  path.join(root, 'docs/chess/favicon.ico'),
  path.join(root, 'docs/tictactoe/favicon.ico')
];

const logoSvg = path.join(root, 'docs/assets/dignity-logo.svg');
const logoPng = path.join(root, 'docs/assets/dignity-logo.png');

for (const output of outputs) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  execSync(
    `rsvg-convert -w 32 -h 32 "${svg}" -o "${output.replace(/\.ico$/, '.png')}"`,
    { stdio: 'inherit' }
  );
  execSync(
    `magick "${output.replace(/\.ico$/, '.png')}" -define icon:auto-resize=32,16 "${output}"`,
    { stdio: 'inherit' }
  );
  fs.unlinkSync(output.replace(/\.ico$/, '.png'));
}

console.log('Generated favicon.ico for docs, chess, and tictactoe');

if (fs.existsSync(logoSvg)) {
  execSync(`rsvg-convert -w 840 -h 160 "${logoSvg}" -o "${logoPng}"`, { stdio: 'inherit' });
  console.log('Generated dignity-logo.png for README');
}
