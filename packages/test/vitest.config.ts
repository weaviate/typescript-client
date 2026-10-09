import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist', 'src/proto'],
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 100000,
  },
  resolve: {
    alias: {
      '@weaviate/core': path.resolve(__dirname, '../core/src'),
      '@weaviate/core/*': path.resolve(__dirname, '../core/src/*'),
    },
  },
});
