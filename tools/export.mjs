/** Package the dependency-free site. No compilation or framework is needed. */
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assets = ['index.html', 'favicon.svg', 'og.png', 'card.png'];
const out = resolve(root, 'dist');
await mkdir(out, { recursive: true });
let bytes = 0;
for (const asset of assets) {
  const source = resolve(root, asset);
  if (asset.endsWith('.png')) {
    const buffer = await readFile(source);
    if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${asset} must be a PNG`);
  }
  await copyFile(source, resolve(out, asset));
  bytes += (await stat(source)).size;
}
console.log(`Production export: dist/ (${assets.length} files, ${bytes.toLocaleString('en-US')} bytes).`);
