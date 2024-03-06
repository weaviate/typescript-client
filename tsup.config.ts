import { defineConfig } from 'tsup';

export default defineConfig([
  // {
  //   entry: [
  //     'src/index.ts',
  //     '!src/index.node.ts',
  //     '!src/**/*.test.ts',
  //     '!src/collections/**/*.ts',
  //     '!src/connection/grpc.ts',
  //     '!src/connection/helpers.ts',
  //     '!src/proto/**/*.ts',
  //     '!src/grpc',
  //   ],
  //   format: ['cjs', 'esm'],
  //   outDir: 'dist',
  //   clean: true,
  //   platform: 'neutral',
  //   minify: true,
  //   dts: true,
  //   splitting: true,
  //   treeshake: true,
  // },
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs'],
    outDir: 'dist/node',
    dts: true,
    target: 'node16',
    platform: 'node',
  },
]);
