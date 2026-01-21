import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        // This replicates the Jest moduleNameMapper for handling relative .js imports in ESM
        find: /^(\.{1,2}\/.*)\.js$/,
        replacement: '$1',
      },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/unit.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['test/**/integration.test.ts', 'test/**/mock.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'journey',
          include: ['test/**/journey.test.ts'],
        },
      },
    ],
    clearMocks: false,
    coverage: {
      enabled: false,
      provider: 'v8',
      reportsDirectory: 'coverage',
      exclude: [
        // Vitest defaults already exclude node_modules/** and dist/**,
        // but explicitly adding your custom ignore for src/proto
        'src/proto/**',
        ...[], // Add any other defaults if needed, but not necessary
      ],
    },
    environment: 'node',
    testTimeout: 100000,
  },
});
