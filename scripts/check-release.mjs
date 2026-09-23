import assert from 'node:assert/strict';
import { appendFile, readFile } from 'node:fs/promises';

const tag = process.env.GITHUB_REF_NAME ?? '';

if (/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-alpha\.(0|[1-9]\d*)$/.test(tag)) {
  const { version } = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(tag.slice(1), version, 'Release tag must match the root package version');
  await Promise.all(
    ['core', 'node', 'web'].map(async (name) => {
      const pkg = JSON.parse(await readFile(`packages/${name}/package.json`, 'utf8'));
      assert.equal(pkg.version, version, `@weaviate/${name}: run tools/prepare_release.sh before tagging`);
    })
  );
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  }
  console.log(`Ready to release ${version}`);
} else {
  console.log(`Skipping non-alpha release tag: ${tag}`);
}
