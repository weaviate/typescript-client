// Assembles a publishable `weaviate-client` package at stage/weaviate-client from the
// built @weaviate/node and @weaviate/core workspace packages.
//
// Interim shape until @weaviate/core is on npm: core is shipped inside the tarball as a
// bundled dependency. Node's emitted JS and .d.ts import the bare specifier
// `@weaviate/core`, which resolves to the nested node_modules copy at runtime and in tsc.
//
// npm facts this script depends on (verified against npm 11):
//   - a name is only bundled if it appears in both `dependencies` and `bundleDependencies`;
//   - npm bundles only what is on disk under node_modules at pack time, so core's own runtime
//     dependencies must be hoisted into the outer `dependencies` to be installed;
//   - `pnpm pack` must not be used here: pnpm 10 rejects bundleDependencies outside the
//     hoisted linker and ignores workspace packages even then.
//
// Requires `npm run build:core && npm run build:node` to have run first.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const rootPkg = readJson(path.join(root, 'package.json'));
const nodeDir = path.join(root, 'packages/node');
const coreDir = path.join(root, 'packages/core');
const nodePkg = readJson(path.join(nodeDir, 'package.json'));
const corePkg = readJson(path.join(coreDir, 'package.json'));

for (const dir of [path.join(nodeDir, 'dist'), path.join(coreDir, 'dist')]) {
  if (!fs.existsSync(dir)) {
    console.error(`missing ${dir}: run build:core and build:node first`);
    process.exit(1);
  }
}

const stage = path.join(root, 'stage/weaviate-client');
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

fs.cpSync(path.join(nodeDir, 'dist'), path.join(stage, 'dist'), { recursive: true });
const coreStage = path.join(stage, 'node_modules/@weaviate/core');
fs.mkdirSync(coreStage, { recursive: true });
fs.cpSync(path.join(coreDir, 'dist'), path.join(coreStage, 'dist'), { recursive: true });
fs.copyFileSync(path.join(coreDir, 'package.json'), path.join(coreStage, 'package.json'));
for (const f of ['LICENSE', 'README.md']) fs.copyFileSync(path.join(root, f), path.join(stage, f));

const { ['@weaviate/core']: _workspaceSpec, ...nodeDeps } = nodePkg.dependencies;
const prerelease = rootPkg.version.split('-')[1]?.split('.')[0];

const manifest = {
  name: rootPkg.name,
  version: rootPkg.version,
  description: rootPkg.description,
  main: nodePkg.main,
  type: nodePkg.type,
  exports: nodePkg.exports,
  files: nodePkg.files,
  engines: nodePkg.engines,
  repository: rootPkg.repository,
  keywords: rootPkg.keywords,
  author: rootPkg.author,
  license: rootPkg.license,
  bugs: rootPkg.bugs,
  homepage: rootPkg.homepage,
  dependencies: {
    '@weaviate/core': corePkg.version,
    ...corePkg.dependencies,
    ...nodeDeps,
  },
  bundleDependencies: ['@weaviate/core'],
  publishConfig: { tag: prerelease ?? 'latest' },
};

fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`staged ${manifest.name}@${manifest.version} (tag: ${manifest.publishConfig.tag}) at ${stage}`);
