/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
  },
  setupFiles: ['./tests/setup.ts'],

  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10_000,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    globals: true,
    hookTimeout: 10_000,
  },
});
