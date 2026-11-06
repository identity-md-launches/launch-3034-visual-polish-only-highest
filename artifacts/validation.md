# Wheel Raid validation

Completed 2026-11-06. This is the worker’s local evidence, not an independent certification.

## Scope and assumptions

This revision preserves the single-file static dapp, its page text, section order, contract art, wallet connector, Sepolia configuration and transaction code. The eight supplied substitutions are the only differences in the original application script. The additional script is decorative only. All 41 original element IDs remain, including the original SVG definition IDs. No contract, build configuration, dependency, manifest, lockfile, submodule or deployment was changed or executed.

The site needs no frontend packages and has no new lockfile. The explicit instruction to preserve dependencies and use no framework/build step takes precedence over the generic dependency-lockfile criterion. `node tools/export.mjs` is static packaging, not compilation. Four complete files are supplied in `dist/`, using relative local asset links.

The live startup check used the app’s unchanged public Sepolia RPC configuration (`https://ethereum-sepolia-rpc.publicnode.com`, fallback `https://1rpc.io/sepolia`) and the existing wheel API. The last interaction run read **Grumblegut the Dust Bunny**, **4,000 / 4,000 HP**, round **364**, a genuine spawn event, and the board/hall’s truthful empty states. There were no historical bosses or current raiders in that live state, so populated and signed-interaction states were tested separately with clearly synthetic fixtures. Fixtures never enter `dist/`.

## Requirement coverage

| Requirement | Result and evidence |
| --- | --- |
| Exact eight advisories | Met. Application script equals the original plus only (a)–(h). Its SHA-256 is `06cae58bc340f22642a4b6e28081d72d613ddec614ed59090495d2438995c3f3`; `tools/check.mjs` enforces it. |
| Castle, moon, fog, torches, embers, engraved ring | Met. Rich inline SVG, separate scenery depth layers, pointer parallax and rune frame in `index.html`. Desktop/phone screenshots inspected. |
| Helmeted hamster; conditional wheel/legs | Met. Detailed SVG; fresh running status starts both animations; resting, expired status, touch parallax and reduced-motion cases checked. |
| Hit shake, slash, sparks and damage numbers | Met. Two consecutive strikes checked, including a regression guard against replaying the arena entrance. Existing `.pop` elements remain in `#pops`. |
| HP metal rail, shine and readable incoming ghost | Met. Inset rail with end caps, red shine and gold hatching. A simulated settled hit exposes the ghost beyond the health fill. |
| Refined panels, type, controls and toast | Met. Shared spacing, six type sizes, stone texture, hover/pressed/focus/disabled states, nonblocking entrance motion and toast icon. |
| Leaderboard | Met. Three medal treatments, numeric alignment and an independently scrollable, labeled region. ArrowRight scrolls it on the phone layout. |
| Trophy hall and older bosses | Met. Fallen/fled plaque treatments; claim/owned states; 24 → 48 → 72 history limit, 24/24/4 request pages, all 51 synthetic past bosses reached. An empty newest page still exposes older history. |
| Sharing assets | Met. New sword-through-wheel favicon. 1200×630 `og.png`, exact title/line, red RAID, correct Open Graph/Twitter image URL. Existing `card.png` preserved. |
| Static host behavior | Met locally. Root and `/preview/` return the titled page with 200; PNG assets return 200 `image/png`. No missing local resources. |
| Responsive first screen | Met. At 390×844 the action spans y=676.22–732.22. No page overflow at 320/390/800/1280/1440. |
| Source/export/docs | Met. Root source and assets, exact `dist/`, maintenance/check tools, README, DESIGN.md and these records included. No runtime dependency installation. |

No visible feature is backed by invented production data. Publishing/hosting the delivered export is outside this task.

## Better Interface: all six domains

| Domain | Coverage and evidence | Limits |
| --- | --- | --- |
| Accessibility — Checked | Native actions, preserved progress/live-region semantics, accessible names, visible keyboard focus, 44 px secondary targets; leaderboard region has name and focus; actual ArrowRight scroll; 30 axe WCAG-tagged rules passed with zero violations; reduced/forced-color states inspected. | No screen-reader session, physical device or full accessibility certification. Axe left gradient contrast incomplete; sampled contrast supplements it. |
| Layout — Checked | Actual export at 320, 390, 800, 1280 and 1440; filled table/hall, wrapping names, live empty states, local table scrolling, primary-action visibility and no document overflow. RTL mirror at 390 and 200% text enlargement at 1280 also checked. | Browser-native zoom and translated content not verified. |
| Writing — Checked | Original page text and application strings retained except the exact requested replacements. Reviewed action labels, hints, empty/error states and terminology against their handlers. Cached connected-wallet status becomes explicitly unknown after expiry. | No general copy rewrite; original connector and toast-dismissal behavior retained under the brief’s preservation constraint. |
| Typography — Checked | Loaded Latin Bungee/Barlow/JetBrains Mono faces confirmed; six computed sizes and two weights in the live probe; data uses tabular numerals; 320 px names wrap without CSS truncation. | Other language subsets and operating-system font rasterizers not inspected. |
| Colors — Checked | Required palette retained, darker action ramps, stable level-label backing. 66 rest/hover text-box measurements sampled nine actual raster background positions each. Sampled main-action minimum 5.24:1 at rest, 4.89:1 on hover; level label 11.33:1. All samples meet their 4.5:1 / 3:1 thresholds. | Samples are not every pixel/state. The probe left 87 gradient/image text boxes unmeasured; no blanket contrast claim. Only the requested dark theme exists. |
| UI — Checked | Hover/active/focus/disabled, initial/empty, pending, success, cancellation and wrong-chain states; medals, plaques and toast; repeated impact timing; fine/coarse pointer guards; zero running animations under reduced motion. | Native wallet prompts, browser-app handoff, WebKit and physical touch not verified. No Animations-panel replay at 10% speed; timing and repeated completion were checked programmatically and in screenshots. |

## Findings and corrections

All applicable findings below are resolved in the final export. Source locations refer to the current root HTML.

| Severity / source | Finding, correction and recheck |
| --- | --- |
| Medium — `index.html:21` | Shared typography had many ad hoc sizes. Consolidated active styles into six tokens and plain body labels. Final live probe reports six sizes including one-offs, three families, two weights, no wide content tracking or kicker labels. |
| Medium — `index.html:66` | The early action ramp’s light edge (`#fff3e6` over `#d93249`) computed to 4.27:1, below the small-phone text requirement. Darkened both red ramps; final actual background samples measure 5.24:1 at rest and 4.89:1 on hover. |
| Medium — `index.html:101` | The small level label crossed a bright part of the moon in the 390 px scene. Added a dark backing without changing its text; final sampled contrast is 11.33:1. |
| Medium — `index.html:153` and the `.tablebox` markup | The table needed a native keyboard route into its horizontal scroller. Added region semantics, an accessible section label and `tabindex=0`; the actual ArrowRight interaction scrolls the table without moving the document horizontally. |
| Medium — `index.html:82` | An early desktop first screen exposed 124 words of prose from the instruction section. Gave the arena a 640 px composition with more room for the scene. Final probe: 56 desktop prose words and 38 phone prose words; the phone action remains fully visible. |
| Low — `index.html:116` | The first probe flagged an outer shadow plus border on the HP rail. Changed it to inset construction shading. Final chrome check reports zero border/shadow surfaces and zero nested cards. |
| Medium — `index.html:248` | A focused rendered check found `enter` restarting on the arena immediately after its hit class ended. Moved entrance animation to `.stage` and `.info`; kept shake on the arena. The repeated-hit test now explicitly asserts zero running arena entrance animations after either strike. |
| Medium — `index.html:528`, `:570`, `:710`, `:760`, `:775`, `:809`, `:812`, `:824` | Applied the eight supplied state/freshness/history fixes exactly. Confirmed expired cached readings stop running animation and refresh the connected hint; history paging reaches the oldest page and works when the first page has no completed boss. Application integrity check passes. |
| Medium — `index.html:11`, `:13`; `favicon.svg` | Updated the requested public sharing URL and provided the new arena PNG and sword/wheel icon. Verified metadata, 1200×630 PNG dimensions, and HTTP MIME/status for both PNGs. |

## Commands and actual results

Commands ran from the repository root. Optional tool module/browser paths pointed to already available tools or scratch-only tool downloads; no checking dependency was delivered in the site.

| Command / check | Actual result |
| --- | --- |
| `node tools/export.mjs` | Passed after the final runtime change: 4 files, **786,595 bytes**. |
| `node tools/check.mjs` | Passed: exact application/copy/ID integrity, both script syntax checks, metadata, PNGs, unique IDs, reduced-motion guard and byte-identical export. |
| `WHEEL_RAID_TYPESCRIPT=… node tools/typecheck.mjs` | Passed using TypeScript 5.9.3, strict `checkJs`, `noEmit`, ES2022+DOM, for the new decorative script. The preserved application is syntax/integrity checked, not migrated to TypeScript. |
| `WHEEL_RAID_PLAYWRIGHT=… node tools/browser-check.mjs --http-bridge` | Passed **25/25** interaction scenarios after the final motion fix. Real startup reads; synthetic wallet/receipts for transactions; no page errors, error console messages or failed bridged remote requests. |
| `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste` | Ran the pinned probe. Final direct run: **16/16**. Direct browser networking could not load the remote services in this environment, so this alone does not establish live-data/font coverage. |
| Same pinned probe with a scratch HTTP-transport bridge | Final export: **16/16**, genuine chain/API/font responses, no fixtures. Measurement code/thresholds unchanged. Results in `taste-results.json`; screenshots inspected at 390/1440 and 320 reflow measured. |
| Axe 4.10.3, WCAG 2 A/AA + 2.1/2.2 AA tags | Zero violations; 30 rules passed; color contrast marked incomplete for gradient backgrounds. See `accessibility-results.json`. |
| Raster contrast sampling at 390, rest + hover | All **66** measured text boxes passed their threshold. The temporary check hid lettering without moving layout, sampled real backgrounds, and used original computed foreground colors. See `contrast-samples.json`. |
| Final screenshot capture and asset requests | Real app, 1280 and 390; root/subpath and PNG status/MIME checked; loaded fonts recorded in `screenshot-evidence.json`. |

The raw temporary audit scripts and probe inputs live under `test/scratch/` / the supplied reads and are removed by the assignment. Repeatable source/export/type/browser checks are delivered under `tools/`.

## Rendered evidence

- [Desktop at 1280 px, full page](screenshots/desktop-1280.png).
- [Phone first screen at 390×844](screenshots/phone-390.png).
- [Interaction results](interaction-results.json), [live design-probe results](taste-results.json), [accessibility results](accessibility-results.json), [contrast samples](contrast-samples.json), [viewport/font evidence](screenshot-evidence.json).

Additional temporary screenshots inspected populated gold/fled plaques, impact/slash/damage feedback, wallet recovery, keyboard focus, reduced-motion, forced-colors and RTL states. They are not shipped as extra packaging assets.

## Submission size and exclusions

`dist/` contains only `index.html`, `favicon.svg`, `og.png` and `card.png`. Source/runtime assets remain complete. No node_modules, tool cache, package archive, vendored registry, submodule or dependency change is included.

The inherited ignore rules excluded `artifacts/`. The new root `.gitignore` makes only nine explicit delivery files available and retains generated-directory exclusions at every nesting level. Its **3,407,872-byte (3.25 MiB) aggregate budget** and individual path caps are written directly in that file. The two screenshots have caps of 2,621,440 and 393,216 bytes; reports/licenses have individual 8–64 KiB caps. All other artifact paths stay excluded. This narrow exception is necessary for the documentation’s links and evidence to travel in the repository.

The final conservative size check passed: **4,032,240** bytes across **24** added or modified Git paths, including this document, below **8,388,608 bytes**. Allowlisted artifacts total **2,489,749** bytes, below their 3,407,872-byte aggregate budget; every individual path cap also passed. This counts entire current files rather than only their diff. No ignore rule allows dependency or cache archives.

## Completion and limits

**Complete for the stated visual scope.** The application script, source/export integrity, responsive behavior, real reads and unsigned interaction paths were checked after the last runtime correction.

No live signature or transaction was sent. Mock receipts establish UI state and calldata behavior, not on-chain transaction success. The existing deployed contracts were not rebuilt or independently audited. Real browser-wallet prompts, mobile-app handoff, physical phones, WebKit, screen readers and native zoom remain unverified. The browser tool’s Chrome distribution was missing; the available Playwright headless Chromium provided the actual rendered inspections. Remote-resource checks used a Node HTTP bridge because direct browser network access was unavailable; production RPCs and runtime code were unchanged.
