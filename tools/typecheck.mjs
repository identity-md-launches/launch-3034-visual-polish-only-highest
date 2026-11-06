/** Strict typecheck for the only new runtime JavaScript: the decorative script. */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

let imported;
try {
  imported = await import(process.env.WHEEL_RAID_TYPESCRIPT || 'typescript');
} catch {
  throw new Error('Use an external TypeScript installation: WHEEL_RAID_TYPESCRIPT=/absolute/path/to/typescript/lib/typescript.js node tools/typecheck.mjs');
}
const ts = imported.default || imported;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
const source = scripts.at(-1)[1];
const virtualFile = resolve(root, 'tools', 'arena-effects.check.js');
const options = { allowJs: true, checkJs: true, noEmit: true, strict: true,
  target: ts.ScriptTarget.ES2022, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'] };
const host = ts.createCompilerHost(options);
const getSourceFile = host.getSourceFile.bind(host);
host.getSourceFile = (file, ...args) => resolve(file) === virtualFile
  ? ts.createSourceFile(virtualFile, source, options.target, true, ts.ScriptKind.JS)
  : getSourceFile(file, ...args);
const program = ts.createProgram([virtualFile], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => root, getCanonicalFileName: file => file, getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else console.log(`PASS: decorative JavaScript, strict checkJs/noEmit (TypeScript ${ts.version}). The preserved application is syntax-checked by tools/check.mjs.`);
