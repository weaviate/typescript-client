import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: [
      'src/v2/index.ts',
      '!src/index.ts',
      '!src/**/*.test.ts',
      '!src/collections/**/*.ts',
      '!src/connection/grpc.ts',
      '!src/connection/helpers.ts',
      '!src/proto/**/*.ts',
      '!src/grpc',
    ],
    format: ['cjs', 'esm'],
    outDir: 'dist/web',
    clean: true,
    platform: 'browser',
    minify: true,
    dts: true,
    splitting: true,
    treeshake: true,
  },
  // {
  //   entry: {
  //     index: 'src/index.ts',
  //   },
  //   format: ['cjs'],
  //   outDir: 'dist/node/cjs',
  //   dts: true,
  //   target: 'node16',
  //   platform: 'node',
  // },
]);
