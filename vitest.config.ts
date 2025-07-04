import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.test.{ts,mts,js,mjs}'],
    setupFiles: ['./tests/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage/vitest',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@shared': resolve(__dirname, './shared'),
    },
  },
  esbuild: {
    target: 'esnext',
  },
});
