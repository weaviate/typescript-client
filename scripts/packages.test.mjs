import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const usage = 'Usage: node scripts/packages.test.mjs <package> <old-version-or-tag> <new-version-or-tag>';
const options = { maxBuffer: 16 * 1024 * 1024 };

async function download(name, ref, dir) {
  await mkdir(dir);
  const spec = `${name}@${ref}`;
  console.error(`Downloading ${spec}...`);
  const { stdout } = await exec('npm', ['pack', '--json', '--ignore-scripts', '--', spec], {
    ...options,
    cwd: dir,
  });
  const [packed] = JSON.parse(stdout);
  const tarball = path.join(dir, packed.filename);
  const [{ stdout: manifest }, { stdout: listing }] = await Promise.all([
    exec('tar', ['-xOf', tarball, 'package/package.json'], options),
    exec('tar', ['-tzf', tarball], options),
  ]);
  const pkg = JSON.parse(manifest);
  if (pkg.name !== name) {
    throw new Error(`Expected ${name}, received ${pkg.name} from ${spec}`);
  }
  const files = new Set(
    listing
      .trim()
      .split('\n')
      .filter((file) => !file.endsWith('/'))
      .map((file) => file.replace(/^package\//, ''))
  );
  return { pkg, files };
}

function reportFiles(label, files) {
  console.log(`\n${label} (${files.length})`);
  for (const file of files.sort()) {
    console.log(`  ${file}`);
  }
}

function reportChanges(label, before = {}, after = {}) {
  const changes = [];
  for (const key of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()) {
    if (!Object.hasOwn(after, key)) {
      changes.push(`- ${key}: ${JSON.stringify(before[key])}`);
    } else if (!Object.hasOwn(before, key)) {
      changes.push(`+ ${key}: ${JSON.stringify(after[key])}`);
    } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes.push(`~ ${key}: ${JSON.stringify(before[key])} -> ${JSON.stringify(after[key])}`);
    }
  }
  console.log(`\n${label}: ${changes.length ? `${changes.length} changes` : 'unchanged'}`);
  for (const change of changes) {
    console.log(`  ${change}`);
  }
}

function exportsMap(pkg) {
  const value = pkg.exports;
  if (value === undefined) {
    return {};
  }
  if (value && !Array.isArray(value) && typeof value === 'object') {
    if (Object.keys(value).some((key) => key.startsWith('.'))) {
      return value;
    }
  }
  return { '.': value };
}

function missingExportTargets(pkg, files) {
  const missing = [];
  function visit(value, location) {
    if (typeof value === 'string' && value.startsWith('./')) {
      const target = value.slice(2);
      const pattern = new RegExp(
        `^${target
          .split('*')
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('.*')}$`
      );
      if (![...files].some((file) => pattern.test(file))) {
        missing.push(`${location}: ${value}`);
      }
    } else if (value && typeof value === 'object') {
      for (const [key, target] of Object.entries(value)) {
        visit(target, `${location}[${JSON.stringify(key)}]`);
      }
    }
  }
  visit(exportsMap(pkg), 'exports');
  return missing;
}

async function compare(name, oldRef, newRef) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'compare-packages-'));
  try {
    const before = await download(name, oldRef, path.join(temp, 'old'));
    const after = await download(name, newRef, path.join(temp, 'new'));
    console.log(`\n${name}: ${before.pkg.version} (${oldRef}) -> ${after.pkg.version} (${newRef})`);
    console.log(`Tarball files: ${before.files.size} -> ${after.files.size}`);
    console.log('Legend: - removed, + added, ~ changed');

    reportFiles(
      'Missing files in the new tarball',
      [...before.files].filter((file) => !after.files.has(file))
    );
    reportFiles(
      'Added files in the new tarball',
      [...after.files].filter((file) => !before.files.has(file))
    );
    for (const field of [
      'dependencies',
      'optionalDependencies',
      'peerDependencies',
      'peerDependenciesMeta',
    ]) {
      reportChanges(field, before.pkg[field], after.pkg[field]);
    }
    const fields = [
      'main',
      'module',
      'types',
      'typings',
      'type',
      'browser',
      'bin',
      'bundleDependencies',
      'bundledDependencies',
    ];
    const entryFields = (pkg) =>
      Object.fromEntries(fields.filter((key) => Object.hasOwn(pkg, key)).map((key) => [key, pkg[key]]));
    reportChanges('Entry points and bundled dependencies', entryFields(before.pkg), entryFields(after.pkg));
    reportChanges('Exports', exportsMap(before.pkg), exportsMap(after.pkg));
    reportFiles('Export targets absent from the new tarball', missingExportTargets(after.pkg, after.files));
    if (before.pkg.exports === undefined && after.pkg.exports !== undefined) {
      console.log('\nThe new exports map restricts subpath imports that were previously unrestricted.');
    }
    console.log('\nThis compares file paths and manifests, not exported symbols or runtime compatibility.');
    console.log('Files supplied by dependencies are not included; removals and moves may be intentional.');
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
  console.log(usage);
  console.log(
    'Versions and npm dist-tags are accepted. Differences are informational; errors exit with code 1.'
  );
} else if (args.length !== 3 || args.some((arg) => !arg || arg.startsWith('-'))) {
  console.error(usage);
  process.exitCode = 1;
} else {
  try {
    await compare(...args);
  } catch (error) {
    console.error(`Package comparison failed: ${error.stderr?.trim() || error.message}`);
    process.exitCode = 1;
  }
}
