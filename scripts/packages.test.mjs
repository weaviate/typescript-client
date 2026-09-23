import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { Application, ReflectionKind } from 'typedoc';
import ts from 'typescript';

const exec = promisify(execFile);
const usage = 'Usage: node scripts/packages.test.mjs <package> <old-version-or-tag> <new-version-or-tag>';

async function install(name, ref, dir) {
  await mkdir(dir);
  await writeFile(path.join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  console.error(`Installing ${name}@${ref} and its dependencies...`);
  await exec(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      '--',
      `${name}@${ref}`,
      '@types/node',
    ],
    {
      cwd: dir,
      maxBuffer: 16 * 1024 * 1024,
    }
  );
  const packageDir = path.join(dir, 'node_modules', name);
  const pkg = JSON.parse(await readFile(path.join(packageDir, 'package.json'), 'utf8'));
  if (pkg.name !== name) {
    throw new Error(`Expected ${name}, received ${pkg.name}`);
  }
  return { dir, packageDir, pkg };
}

function exportTargets(value) {
  if (typeof value === 'string') return [value];
  return value && typeof value === 'object' ? Object.values(value).flatMap(exportTargets) : [];
}

async function publicPaths({ pkg, packageDir }) {
  if (pkg.exports === undefined) return ['.'];
  const exports = pkg.exports;
  const map =
    exports && typeof exports === 'object' && Object.keys(exports).some((key) => key.startsWith('.'))
      ? exports
      : { '.': exports };
  const paths = new Set();
  const files = Object.keys(map).some((key) => key.includes('*'))
    ? await readdir(packageDir, { recursive: true })
    : [];
  for (const [subpath, target] of Object.entries(map)) {
    if (target === null || subpath.endsWith('.json')) continue;
    if (!subpath.includes('*')) {
      paths.add(subpath);
      continue;
    }
    for (const pattern of exportTargets(target)) {
      const regex = new RegExp(
        `^${pattern
          .replace(/^\.\//, '')
          .split('*')
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('(.+)')}$`
      );
      for (const file of files) {
        const match = file.match(regex);
        if (match?.[1]) paths.add(subpath.replace('*', match[1]));
      }
    }
  }
  return [...paths].sort();
}

async function documentPackage(installed, name) {
  const { dir } = installed;
  const compilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ESNext,
    strict: true,
    skipLibCheck: false,
    types: ['node'],
  };
  const wrappers = [];
  for (const subpath of await publicPaths(installed)) {
    const spec = subpath === '.' ? name : `${name}/${subpath.slice(2)}`;
    for (const [mode, extension, resolutionMode] of [
      ['import', 'mts', ts.ModuleKind.ESNext],
      ['require', 'cts', ts.ModuleKind.CommonJS],
    ]) {
      const file = path.join(dir, `${mode}-${wrappers.length}.${extension}`);
      const resolved = ts.resolveModuleName(
        spec,
        file,
        compilerOptions,
        ts.sys,
        undefined,
        undefined,
        resolutionMode
      ).resolvedModule;
      if (!resolved) continue;
      if (!/\.d\.[cm]?ts$/.test(resolved.resolvedFileName)) {
        throw new Error(`${spec} (${mode}) has no resolvable TypeScript declarations`);
      }
      wrappers.push({ file, spec, mode });
    }
  }
  if (!wrappers.length) throw new Error(`No public declaration entry points found for ${name}`);
  await Promise.all(
    wrappers.map(({ file, spec }) => writeFile(file, `export * from ${JSON.stringify(spec)};\n`))
  );
  const program = ts.createProgram(
    wrappers.map(({ file }) => file),
    compilerOptions
  );
  const checker = program.getTypeChecker();
  await Promise.all(
    wrappers.map(async ({ file, spec }) => {
      const source = program.getSourceFile(file);
      const module = checker.getSymbolAtLocation(source.statements[0].moduleSpecifier);
      if (!module) throw new Error(`Cannot resolve exports of ${spec}`);
      if (checker.getExportsOfModule(module).some((symbol) => symbol.name === 'default')) {
        await writeFile(
          file,
          `export * from ${JSON.stringify(spec)};\nexport { default } from ${JSON.stringify(spec)};\n`
        );
      }
    })
  );
  const config = path.join(dir, 'tsconfig.json');
  await writeFile(
    config,
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ESNext',
        strict: true,
        skipLibCheck: false,
        types: ['node'],
      },
      files: wrappers.map(({ file }) => file),
    })
  );
  const app = await Application.bootstrap({
    entryPoints: wrappers.map(({ file }) => file),
    tsconfig: config,
    alwaysCreateEntryPointModule: true,
    excludeExternals: false,
    excludeReferences: false,
    excludeNotDocumented: false,
    excludeInternal: false,
    disableSources: true,
    readme: 'none',
    logLevel: 'Error',
  });
  const project = await app.convert();
  if (!project || app.logger.hasErrors())
    throw new Error(`TypeDoc could not describe ${name}@${installed.pkg.version}`);
  const json = app.serializer.projectToObject(project, dir);
  const labels = new Map(
    wrappers.map(({ file, spec, mode }) => [
      path.basename(file).replace(/\.[cm]ts$/, ''),
      `${spec} [${mode}]`,
    ])
  );
  return apiSnapshot(json, labels);
}

const metadata = new Set([
  'id',
  'sources',
  'comment',
  'groups',
  'categories',
  'readme',
  'documents',
  'variant',
  'package',
  'packageVersion',
  'source',
  'qualifiedName',
  'externalUrl',
  'inheritedFrom',
  'overwrites',
  'implementationOf',
  'implementedBy',
  'extendedBy',
  'isExternal',
  'isInherited',
]);

function normalize(value, key = '') {
  if (Array.isArray(value)) {
    const items = value.map((item) => normalize(item));
    return key === 'children' ? items.sort((a, b) => a.name.localeCompare(b.name)) : items;
  }
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .filter((name) => !metadata.has(name) && !(value.type === 'reference' && name === 'target'))
      .map((name) => [name, normalize(value[name], name)])
  );
}

function apiSnapshot(project, labels) {
  const byId = new Map();
  function index(value) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.id === 'number') byId.set(value.id, value);
    Object.values(value).forEach(index);
  }
  index(project);
  const api = new Map();
  function members(node, seen = new Set()) {
    if (!node || seen.has(node)) return [];
    const visited = new Set([...seen, node]);
    if (node.children) return node.children;
    if (node.type && typeof node.type === 'object') return members(node.type, visited);
    if (node.type === 'reflection') return members(node.declaration, visited);
    if (node.type === 'reference') return members(byId.get(node.target), visited);
    if (node.type === 'query') return members(node.queryType, visited);
    if (node.type === 'intersection') {
      return [
        ...new Map(
          node.types.flatMap((type) => members(type, visited)).map((child) => [child.name, child])
        ).values(),
      ];
    }
    return [];
  }
  function visit(original, label, ancestors = new Set()) {
    let node = original;
    const references = new Set();
    while (node.variant === 'reference') {
      if (references.has(node.id)) throw new Error(`Cyclic export reference at ${label}`);
      references.add(node.id);
      node = byId.get(node.target);
      if (!node) throw new Error(`Unresolved export reference at ${label}`);
    }
    if (ancestors.has(node.id)) return;
    const seen = new Set([...ancestors, node.id]);
    const body = node.type?.type === 'reflection' ? node.type.declaration : node;
    const shape = {};
    for (const field of [
      'kind',
      'flags',
      'type',
      'typeParameters',
      'signatures',
      'indexSignatures',
      'getSignature',
      'setSignature',
      'defaultValue',
      'extendedTypes',
      'implementedTypes',
    ]) {
      if (node[field] !== undefined) shape[field] = node[field];
    }
    if (body !== node) {
      const { children, ...declaration } = body;
      shape.type = { type: 'reflection', declaration };
    }
    api.set(label, JSON.stringify(normalize(shape)));
    for (const child of members(node)) {
      if (!child.flags?.isPrivate)
        visit(child, `${label}.${child.flags?.isStatic ? 'static ' : ''}${child.name}`, seen);
    }
  }
  for (const module of project.children ?? []) {
    const label = labels.get(module.name);
    if (!label) throw new Error(`Unexpected TypeDoc entry point: ${module.name}`);
    api.set(label, JSON.stringify({ kind: ReflectionKind.Module }));
    for (const child of module.children ?? []) visit(child, `${label}::${child.name}`);
  }
  return api;
}

function report(before, after) {
  const removed = [...before.keys()].filter((key) => !after.has(key)).sort();
  const added = [...after.keys()].filter((key) => !before.has(key)).sort();
  const changed = [...before.keys()]
    .filter((key) => after.has(key) && before.get(key) !== after.get(key))
    .sort();
  for (const [title, symbols] of [
    ['Removed', removed],
    ['Added', added],
    ['Changed', changed],
  ]) {
    console.log(`\n${title} API items (${symbols.length})`);
    for (const symbol of symbols) {
      console.log(`  ${symbol}`);
      if (title === 'Changed') {
        console.log(`    before: ${before.get(symbol)}`);
        console.log(`    after:  ${after.get(symbol)}`);
      }
    }
  }
  console.log('\nChanges describe declared APIs, not runtime behavior or a proof of type compatibility.');
  console.log('Packages without an exports map are compared at their root entry point only.');
}

async function compare(name, oldRef, newRef) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'compare-package-api-'));
  try {
    const before = await install(name, oldRef, path.join(temp, 'old'));
    const after = await install(name, newRef, path.join(temp, 'new'));
    console.error('Reading public APIs with TypeDoc...');
    const oldApi = await documentPackage(before, name);
    const newApi = await documentPackage(after, name);
    console.log(`\n${name}: ${before.pkg.version} (${oldRef}) -> ${after.pkg.version} (${newRef})`);
    report(oldApi, newApi);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
  console.log(usage);
  console.log('Compares published declarations, including re-exports, for Node import and require.');
  console.log('Differences are informational; installation or analysis errors exit with code 1.');
} else if (args.length !== 3 || args.some((arg) => !arg || arg.startsWith('-'))) {
  console.error(usage);
  process.exitCode = 1;
} else {
  try {
    await compare(...args);
  } catch (error) {
    console.error(`API comparison failed: ${error.stderr?.trim() || error.message}`);
    process.exitCode = 1;
  }
}
