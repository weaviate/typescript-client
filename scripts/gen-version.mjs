import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

let version;
const args = process.argv.slice(2);
if (args.length == 0) version = pkg.version;
else if (args.length == 1) version = args[0];
else {
  console.error('Usage: node gen-version.mjs [version]');
  process.exit(1);
}

// WEAVIATE_CLIENT_VERSION is read by core's HTTP connection for the X-Weaviate-Client header.
fs.writeFileSync(
  path.join(root, 'packages/core/src/version.ts'),
  `export const WEAVIATE_CLIENT_VERSION = '${version.replace('v', '')}';\n`
);
