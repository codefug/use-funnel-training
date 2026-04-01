import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    typecheck: {
      enabled: true,
    },
    include: ['challenges/**/*.test.ts', 'challenges/**/*.test.tsx'],
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@challenges': resolve(__dirname, 'challenges'),
    },
  },
});
