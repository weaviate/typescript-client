import fs from 'fs';
import pkg from '../package.json' with { type: 'json' };

let version;
const args = process.argv.slice(2);
if (args.length == 0) version = pkg.version;
else if (args.length == 1) version = args[0];
else {
  console.error('Usage: node gen-version.mjs [version]');
  process.exit(1);
}

fs.writeFileSync(
  'src/version.ts',
  `export const WEAVIATE_CLIENT_VERSION = '${version}';\n`
);