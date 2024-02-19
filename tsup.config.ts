import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      '!src/index.node.ts',
      '!src/**/*.test.ts',
      '!src/collections/**/*.ts',
      '!src/connection/grpc.ts',
      '!src/connection/helpers.ts',
      '!src/proto/**/*.ts',
    ],
    format: ['cjs', 'esm'],
    outDir: 'dist',
    clean: true,
    platform: 'neutral',
    minify: true,
    dts: true,
  },
  {
    entry: {
      index: 'src/index.node.ts',
    },
    format: ['cjs', 'esm'],
    outDir: 'dist/node',
    clean: true,
    minify: true,
    dts: true,
    target: 'node20',
  },
]);
