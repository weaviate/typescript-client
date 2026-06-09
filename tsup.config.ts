import { defineConfig, type Options } from 'tsup';
import { fileURLToPath } from 'url';

// Shared esbuild tweaks that make a `platform: 'browser'` bundle load without Node
// built-ins. Isomorphic code paths (utils/base64, collections/deserialize) statically
// reference `fs`/`http`/`https` and `Buffer`, but the browser path never exercises the
// file-system/agent helpers. We alias those built-ins to an empty stand-in and inject a
// `Buffer` polyfill at the bundler level, leaving the runtime source untouched.
const applyBrowserShims: NonNullable<Options['esbuildOptions']> = (options) => {
  const shim = fileURLToPath(new URL('./src/web-shims/empty.ts', import.meta.url));
  options.alias = {
    ...(options.alias ?? {}),
    fs: shim,
    http: shim,
    https: shim,
  };
  options.inject = [
    ...(options.inject ?? []),
    fileURLToPath(new URL('./src/web-shims/buffer.ts', import.meta.url)),
  ];
  options.define = { ...(options.define ?? {}), 'process.env.NODE_ENV': '"production"' };
};

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
    esbuildOptions: applyBrowserShims,
  },
  {
    entry: { 'index.web': 'src/index.web.ts' },
    format: ['esm', 'cjs'],
    outDir: 'dist/web',
    clean: false,
    platform: 'browser',
    minify: true,
    dts: true,
    splitting: false,
    treeshake: true,
    esbuildOptions: applyBrowserShims,
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
