// checks that all public entry points are browser-safe, i.e. don't import Node-only modules
import * as esbuild from 'esbuild'
import pkg from '../package.json' with { type: 'json' }

// every public entry point, not just "."
const entries = Object.keys(pkg.exports ?? { '.': {} })
  .map((sub) => (sub === '.' ? pkg.name : `${pkg.name}/${sub.slice(2)}`))

try {
  await esbuild.build({
    stdin: {
      contents: entries.map((e, i) => `import * as m${i} from '${e}'; console.log(m${i})`).join('\n'),
      resolveDir: process.cwd(), // run this from the fixture dir
      loader: 'js',
    },
    bundle: true,
    platform: 'browser',
    format: 'esm',
    write: false,          // nothing hits disk
    logLevel: 'info',
  })
  console.log('✓ browser-safe')
} catch {
  process.exit(1)          // esbuild already printed the offending file:line
}