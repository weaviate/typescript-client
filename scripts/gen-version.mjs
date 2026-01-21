import fs from 'fs';
import pkg from '../package.json' with { type: 'json' };

fs.writeFileSync(
  'src/version.ts',
  `export const WEAVIATE_CLIENT_VERSION = '${pkg.version}';\n`
);