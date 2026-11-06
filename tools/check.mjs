/** Static release checks; Node built-ins only. Run after tools/export.mjs. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'index.html'), 'utf8');
const scripts = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.equal(scripts.length, 2, 'one preserved application script and one decorative script');
scripts.forEach((s, i) => new Script(s, { filename: `index.html script ${i + 1}` }));
assert.equal(createHash('sha256').update(scripts[0]).digest('hex'),
  '06cae58bc340f22642a4b6e28081d72d613ddec614ed59090495d2438995c3f3',
  'application code must remain exactly the original plus the eight requested fixes');
const visibleCopy = source.split('<body>')[1].split('<script>')[0]
  .replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
assert.equal(createHash('sha256').update(visibleCopy).digest('hex'),
  '3f0855db1e643e2edfecdc34519568264cff2f4c9c73e4175a08026e22dffe33', 'existing page copy is preserved');
const originalIds = ['actions', 'arena', 'board', 'boardCount', 'boardTitle', 'bossArt', 'bossEyebrow', 'bossLvl', 'bossName', 'chargeHint', 'feed', 'fleeTxt', 'fog', 'hall', 'hallSub', 'hallTitle', 'howTitle', 'hpBar', 'hpFill', 'hpGhost', 'hpIncoming', 'hpTxt', 'links', 'logTitle', 'moon', 'myQueue', 'notDeployed', 'notDeployedTxt', 'pops', 'rLeft', 'rNow', 'rRpm', 'runDot', 'runTxt', 'stDmg', 'stNow', 'stPower', 'stRally', 'toast', 'wBtns', 'wState'];
for (const id of originalIds) assert(source.includes(`id="${id}"`), `preserved element ID ${id}`);
assert(!/<script[^>]+src=/i.test(source), 'no external runtime scripts');
assert(source.includes('<title>Wheel Raid</title>'));
assert(source.includes('name="description"'));
assert(source.includes('property="og:title"'));
for (const field of ['property="og:image"', 'name="twitter:image"']) {
  assert(source.includes(`<meta ${field} content="https://wheel-raid.imd.site/og.png">`));
}
assert(source.includes('href="favicon.svg"'));
assert(!/transition\s*:\s*all\b/.test(source));
assert(source.includes('(prefers-reduced-motion:reduce)'));
const ids = [...source.slice(0, source.indexOf('<script>')).matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML and inline SVG IDs are unique');
const expected = ['card.png', 'favicon.svg', 'index.html', 'og.png'];
assert.deepEqual((await readdir(resolve(root, 'dist'))).sort(), expected, 'export has only runtime assets');
let bytes = 0;
for (const file of expected) {
  const input = await readFile(resolve(root, file));
  const output = await readFile(resolve(root, 'dist', file));
  assert(input.equals(output), `${file} export matches source`);
  if (file.endsWith('.png')) {
    assert.equal(input.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert(input.readUInt32BE(16) > 0 && input.readUInt32BE(20) > 0);
    if (file === 'og.png') {
      assert.equal(input.readUInt32BE(16), 1200);
      assert.equal(input.readUInt32BE(20), 630);
    }
  }
  bytes += input.length;
}
assert(bytes < 8 * 1024 * 1024, 'production export fits the submission limit');
console.log(`PASS: application integrity, both script syntax checks, metadata, unique IDs, motion guards, PNGs and exact static export (${bytes.toLocaleString('en-US')} bytes).`);
