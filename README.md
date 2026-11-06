# Wheel Raid

A co-op boss raid powered by Squeektoshi's real wheel.

One boss stands at a time. While the hamster runs, raiders **charge** the 10-minute round in progress (free on Sepolia, one charge per wallet per round). When SqueekCore settles that round, everyone who charged it hits the boss for the round's **real wheel work**, read straight from `SqueekCore.roundPage`. A round where the wheel stood still is a miss.

- **Rally:** +10% damage for each other raider in the same round, up to +50%. Bring friends.
- **Perks:** +25% power for Squeek NFT holders, +25% for Wheeling owners (stacking to 1.5×).
- **Bosses:** 4,000 HP at level 0, ×1.4 per level. A fallen boss is replaced the next round by a stronger one. A boss left standing for a week (1,008 rounds) flees and a fresh one of the same level steps in.
- **Trophies:** everyone who hurt a fallen boss can claim a soulbound on-chain trophy (ERC-721 + ERC-5192). Gold for 25%+ of its max HP, Silver for 8%+, Bronze otherwise, plus a **Killing blow** ribbon for every raider in the final round.
- **All on-chain:** boss names and portraits are generated from a seed and drawn by the contract (`bossSvg`), trophies are SVG + JSON in `tokenURI`. No owner, no admin, no upgrade, no ETH.

## How a round is scored

1. `charge()` records the round in progress with the raider's power. Up to 24 charges per raider can wait for settlement.
2. SqueekCore settles rounds in batches. Charged rounds are applied to the boss in order by `charge`, `claim`, `sync(raider)` or `advance(steps)` (anyone may call the last two).
3. For each charged round ≤ `settledThroughRound`: work = `end.cumulativeWork − start.cumulativeWork` of `roundPage(r−1, r, 1)`, capped at `maxWorkPerRound`. Round damage = work × Σpower/100 × rally(raiders)/100. Each raider is credited work × power/100 × rally/100 on the boss that round hit.
4. If the round empties the boss's HP it falls in that round (overkill still counts for the raiders) and a level+1 boss spawns the next round. If a charged round comes more than a week after the boss spawned, the boss flees first.
5. If SqueekCore cannot serve a settled round, the raid waits for it; a full day later the round counts as a still wheel so the raid never locks.

## Contracts (Sepolia)

| | |
|---|---|
| SqueekCore | `0xfd6c166d4b8e2962e65746a13e5a0797cd4de0c4` |
| Squeek NFT (perk) | `0xc4c7982657f00509548f3a3a41db7fa439a6856b` |
| Wheelings (perk) | `0x13c421454de930e373647cb45dd35a963c21c0a3` |
| RaidArt | [`0xbbeb05ccb7ce3529e6221ab52b2ebc7d5ffc0c0c`](https://sepolia.etherscan.io/address/0xbbeb05ccb7ce3529e6221ab52b2ebc7d5ffc0c0c) |
| WheelRaid | [`0x77240d974bb7a4ccb85021ff2c40ca0324f57896`](https://sepolia.etherscan.io/address/0x77240d974bb7a4ccb85021ff2c40ca0324f57896) (block 12074799) |

Constructor: `WheelRaid(address core, address squeeks, address wheelings, address art)`. Compiler: solc 0.8.26, optimizer on (200 runs), EVM `cancun`. `release/standard-input.json` is the exact compiler input for verification.

## Files

- `index.html` — the whole dapp (no build step, no external scripts). Multi-wallet connect (EIP-6963 + injected), reads Sepolia over public RPCs and the live wheel from `api.squeekchain.com`.
- `contracts/WheelRaid.sol` — WheelRaid and RaidArt.
- `release/` — ABI, standard JSON input, metadata.
- `dev/` — tests: contract unit + randomized model test (Hardhat), Playwright end-to-end against a mock SqueekCore.

Testnet only. Nothing here has value.

## Static website: install, preview and rebuild

No frontend installation or compilation is needed. `index.html` contains all CSS and runtime JavaScript. Google Fonts supplies Bungee, Barlow and JetBrains Mono; there are no external scripts, frameworks, new package manifests or lockfiles. Existing contract/build/dependency files are unchanged. `contracts/`, `release/` and `dev/` are reference material for this visual revision; do not build or run `dev/` to preview the site.

Use Node 22+ for the optional maintenance commands. The production “build” is a dependency-free, byte-for-byte export of the page and its three assets:

```sh
node tools/export.mjs
node tools/check.mjs
```

This produces `dist/index.html`, `dist/favicon.svg`, `dist/og.png` and `dist/card.png`. The export is included in the repository. Publish the contents of `dist/` on any static host. Local asset URLs are relative, so the same files work at a root or gateway subpath. The requested public sharing URL is `https://wheel-raid.imd.site/og.png` in both Open Graph and Twitter metadata.

Preview in a foreground terminal:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:4173/`. Live raid reads require access to the existing Sepolia RPCs and `api.squeekchain.com`; joining the raid requires an EVM wallet and Sepolia test ETH. There is no backend to install and no secret or project ID to configure.

Edit the root HTML/assets, run the export command again, then run the static check. The check verifies that the application script is exactly the original plus the eight requested replacements, existing page copy and IDs are preserved, metadata is correct, both scripts parse, PNG dimensions/signatures are valid, and `dist/` matches the source with no extra files. `og.png` is a 1200×630 capture composed from the implemented arena and its unchanged live contract portrait. `card.png` is preserved.

### Optional deeper checks

These checks use an external tool installation; no checking dependency or cache belongs in this repository:

```sh
WHEEL_RAID_TYPESCRIPT=/absolute/path/to/typescript/lib/typescript.js node tools/typecheck.mjs
WHEEL_RAID_PLAYWRIGHT=/absolute/path/to/playwright/index.mjs node tools/browser-check.mjs
```

TypeScript 5.9.3 was used with strict `checkJs` / `noEmit` for the new decorative script. The existing application remains JavaScript and is covered by syntax, integrity and interaction checks. Playwright requires its Chromium headless browser. On a restricted network, add `--http-bridge` to the browser check: it transports genuine remote responses through Node’s HTTP stack. No runtime code or production RPC configuration changes.

The browser check creates and closes its own local preview, including a `/preview/` subpath. It first reads the real app, then uses a clearly synthetic wallet and RPC responses to exercise transaction UI and historical states. It never signs or broadcasts a transaction. Screenshots and detailed temporary results go under `test/scratch/`.

### Results of this revision

- Production export and static integrity checks passed; four complete runtime files, approximately 768 KiB.
- Strict typechecking of the new decorative JavaScript passed.
- 25 browser interaction checks passed, including live boss/HP/round/log loading; wallet discovery, cancellation, switching and disconnect; Charge; Apply settled hits; Claim trophy; repeated impacts; stale status; and older-boss paging through all test pages.
- Layout checked at 320, 390, 800, 1280 and 1440 px. The 390×844 first screen contains the product and its full main action. No page overflow; the leaderboard scrolls in its own box, including with ArrowRight.
- The pinned taste@1 review passed 16/16 checks with live data and loaded fonts. All animations stopped with reduced motion. Automated WCAG-tagged accessibility checks returned zero violations (30 rules passed; gradient contrast also received manual raster sampling).
- No console errors or failed remote requests occurred in the browser validation using the HTTP bridge.

Live signing, real wallet-app handoff, physical phones, WebKit and screen-reader sessions were not performed. Transaction success/rejection/pending states were validated with a synthetic provider and receipts; live reads were genuine. Browser-native 200% zoom was not available; 200% text enlargement was checked separately. The browser connector’s Chrome launcher was unavailable, so inspection used Playwright’s installed headless Chromium.

The final design system is in [DESIGN.md](DESIGN.md); detailed six-domain coverage, findings, commands, evidence and limitations are in [artifacts/validation.md](artifacts/validation.md).
