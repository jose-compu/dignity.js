import { defineConfig } from 'vitest/config';
import codspeedPlugin from '@codspeed/vitest-plugin';

export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    include: [],
    benchmark: {
      include: ['bench/**/*.bench.mjs']
    }
  }
});
