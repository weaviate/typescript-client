// The client shares Node's compiled output and depends on the published core package.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const rootPkg = readJson(path.join(root, 'package.json'));
const nodeDir = path.join(root, 'packages/node');
const nodePkg = readJson(path.join(nodeDir, 'package.json'));

if (!fs.existsSync(path.join(nodeDir, 'dist'))) {
  console.error('missing packages/node/dist: run build:core and build:node first');
  process.exit(1);
}

const stage = path.join(root, 'stage/weaviate-client');
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

fs.cpSync(path.join(nodeDir, 'dist'), path.join(stage, 'dist'), { recursive: true });
for (const f of ['LICENSE', 'README.md']) fs.copyFileSync(path.join(root, f), path.join(stage, f));

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
    ...nodePkg.dependencies,
    '@weaviate/core': rootPkg.version,
  },
  publishConfig: { tag: prerelease ?? 'latest' },
};

fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`staged ${manifest.name}@${manifest.version} (tag: ${manifest.publishConfig.tag}) at ${stage}`);
