#!/usr/bin/env node
const esbuild = require('esbuild');

// https://esbuild.github.io/api/
esbuild
  .build({
    bundle: true,
    entryPoints: ['./src/index.ts'],
    external: ['@babel/runtime', 'isomorphic-fetch', 'graphql-request'],
    format: 'esm',
    logLevel: 'info',
    metafile: true,
    minify: true,
    outfile: 'dist/index.js',
    platform: 'neutral',
    sourcemap: true,
    target: 'es2020',
  })
  .then((result) => {
    return esbuild.analyzeMetafile(result.metafile);
  })
  .then((analyzeResult) => {
    console.log('------------------------------');
    console.log('Build analysis');
    console.log('------------------------------');
    console.log(analyzeResult);
  })
  .catch((e) => {
    console.error('Build error!', e);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
