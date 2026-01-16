/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/api/unit/**/*.(test|spec).ts',
      'tests/health-check.test.ts',
      'tests/api/integration/**/*.(test|spec).ts',
    ],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    setupFiles: ['tests/setup.ts'],
    testTimeout: 10_000,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    globals: true,
    hookTimeout: 10_000,
  },
});
