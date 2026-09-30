// The client adds the legacy v2 export to Node's compiled output.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';

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

const entry = `export { default } from './src/index.js';
export * from './src/index.js';
export { default as weaviateV2 } from '@weaviate/core/v2';
`;
for (const [format, module] of [
  ['esm', ts.ModuleKind.ESNext],
  ['cjs', ts.ModuleKind.CommonJS],
]) {
  const dir = path.join(stage, 'dist', format);
  const { outputText } = ts.transpileModule(entry, {
    compilerOptions: { module, target: ts.ScriptTarget.ES2022 },
  });
  fs.writeFileSync(path.join(dir, 'client.js'), outputText);
  fs.writeFileSync(path.join(dir, 'client.d.ts'), entry);
}

const prerelease = rootPkg.version.split('-')[1]?.split('.')[0];

const manifest = {
  name: rootPkg.name,
  version: rootPkg.version,
  description: rootPkg.description,
  main: 'dist/cjs/client.js',
  type: nodePkg.type,
  exports: {
    '.': {
      types: {
        require: './dist/cjs/client.d.ts',
        default: './dist/esm/client.d.ts',
      },
      default: {
        require: './dist/cjs/client.js',
        default: './dist/esm/client.js',
      },
    },
  },
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
