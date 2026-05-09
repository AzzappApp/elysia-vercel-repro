// Kept in the repo even though we now use the Vercel framework preset
// rather than this custom build. Mirrors the layout of azzapp/packages/api.
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  outDir: 'dist',
  format: 'esm',
  platform: 'node',
  target: 'node22',
  tsconfig: './tsconfig.json',
  clean: true,
  sourcemap: true,
  dts: false,
  shims: true,
});
