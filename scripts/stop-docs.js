const { execSync } = require('child_process');

const port = process.env.DOCS_PORT || '4173';

try {
  const output = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
  if (!output) {
    console.log(`Nothing listening on port ${port}.`);
    process.exit(0);
  }

  const pids = output.split(/\s+/).filter(Boolean);
  pids.forEach((pid) => {
    try {
      process.kill(Number(pid), 'SIGTERM');
    } catch (error) {
      // ignore stale pid
    }
  });

  console.log(`Stopped process(es) on port ${port}: ${pids.join(', ')}`);
} catch (error) {
  console.log(`Nothing listening on port ${port}.`);
}
