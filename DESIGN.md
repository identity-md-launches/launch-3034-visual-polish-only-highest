# Wheel Raid design system

## Overview

Wheel Raid is a cooperative Sepolia boss raid driven by Squeektoshi’s real wheel. The arena is the main interface: an untouched contract portrait sits inside an engraved stone ring, with ruined castle walls, a blood moon, torchlight, fog and a helmeted hamster alongside it. The supporting panels use the same stone surfaces and gold details with quieter visual emphasis.

The implementation is entirely in [index.html](index.html). Its first script retains the application with exactly the eight requested content advisories. A second, isolated script implements decorative parallax and reacts to the existing `#bossArt.hit` class. It never accesses wallet or raid state.

## Colors

Canonical tokens are in `index.html:21` and use hex colors throughout. The site deliberately has one dark theme.

| Token | Value | Implemented role |
| --- | --- | --- |
| `--bg` | `#12091a` | Page and deep shadow foundation; browser theme color |
| `--panel` | `#201628` | Stone surface family |
| `--panel2` | `#302136` | Neutral button surface |
| `--line` | `#49364e` | Panel structure and dividers |
| `--ink` | `#f6ecdf` | Headings, body emphasis and main data |
| `--mute` | `#c4b2ca` | Supporting copy and table labels |
| `--dim` | `#ad98b6` | Footer and faded trophy-plaque text |
| `--red` | `#ff4d5a` | RAID wordmark, impact details and running-action outline |
| `--ember` | `#ff9a3c` | Boss summary, torches, sparks and warning states |
| `--gold` | `#ffd166` | Focus, links, fallen trophies and trophy claim actions |
| `--teal` / `--ok` | `#58e0c6` | Running status, rally bonus, settled/connected states |

The main action uses `#cb2941 → #ac1b34`, with `#d12b43 → #b92039` on hover. The darker reds preserve readable small-phone lettering while keeping the requested accent palette. Labels use `#fff3e6`. Metal trim and silver/bronze medals use material-specific supporting colors.

At 390 px, nine rendered background samples per measured text box yielded a minimum **5.24:1** for the resting main action and **4.89:1** on hover. The level label’s dark backing measured **11.33:1** at its sampled positions. These are sampled rendered results, not an exhaustive contrast certification; see [validation](artifacts/validation.md).

## Typography

Google Fonts is the only external presentation dependency. The existing font request is retained.

| Family | Role | Used weights |
| --- | --- | --- |
| Bungee, then Impact / Arial Black / system sans | Wordmark, boss name, section titles and charge action | 400 |
| Barlow, then system sans | Body, instructions, labels and secondary buttons | 400, 600 |
| JetBrains Mono, then system monospace | Timers, HP, addresses, statistics and plaque metadata | 400, 600 |

Latin faces for all three families loaded during the rendered check. Unused language subsets and unused requested weights need not download.

There are six semantic sizes: `--text-xs` 13 px, `--text-sm` 15 px, `--text-base` 16 px, `--text-lg` 20 px, `--text-xl` 24 px, and `--text-display` 40 px. The display step becomes 32 px at 520 px and below. The probe confirmed six sizes per tested desktop/phone width, counting one-offs, with only two weights in the rendered page.

Body copy uses 1.55 line height; the boss name uses 1.15 and balanced wrapping. Labels use 1.35–1.6 as appropriate. Display tracking is slightly tight; supporting copy keeps natural tracking and casing. Numeric values use tabular numerals. Long boss names wrap rather than truncate, including at 320 px. Step copy is 16 px and uses pretty wrapping. The overview description is capped at 67 characters in the layout’s `ch` measure.

## Layout

The `.wrap` has a 1240 px maximum width and 32 px inline gutters. Panels use 32 px padding and 24 px vertical separation. The regular spacing vocabulary is 8, 12, 16, 20, 24 and 32 px; illustration geometry has its own coordinates.

The desktop arena has a 640 px minimum height and approximately 52% / 48% stage and information columns. The portrait is 350 px, with a ring at 1.25 times its size. Controls and important information stay in normal document flow. The section order remains arena, instructions, raiders, log, hall.

| Breakpoint | Behavior |
| --- | --- |
| ≤1100 px | 300 px portrait, 550 px arena minimum; tighter information column |
| ≤800 px | One arena column; 340 px stage, 250 px portrait; 24 px page gutters; instructions stack; hall uses two columns |
| ≤520 px | 16 px gutters; 242 px stage, 185 px portrait; 20 px information inset; 56 px main action; one-column hall; 20 px panel inset |
| ≤359 px | 12 px gutters; 224 px stage, 170 px portrait; statistics become two columns; HP detail lines stack |

At 390 × 844, the product and full “Connect to charge” action are visible on the first screen. Populated layouts were checked at 320, 390, 800, 1280 and 1440 px without page overflow. The leaderboard retains every column inside its own focusable horizontal scroll region; it scrolls with touch, a pointer or the keyboard. No critical text uses CSS ellipsis.

A 200% text enlargement at 1280 px and an RTL mirror at 390 px were also checked. This is not a claim of browser-native zoom or translated-language testing.

## Elevation & Depth

`.scene` sits behind the stage and information. Inline SVG supplies distant battlements, closer cracked masonry, ivy, arch fragments, a cratered moon, torch flames and fog. Its right-hand veil keeps text over a dark background. The shared `--stone` texture is a small inline SVG noise tile; it adds no file request.

The ring and hamster use illustration shadows. Structural panels use a border and tonal texture. The HP rail has inset construction shading and separate metallic end caps. Medal glow uses a restrained drop shadow; fallen plaques use a warm tonal glow. The toast is the elevated exception, with a translucent surface and shadow.

Decorative layers have `pointer-events: none`. The arena establishes its own stacking context; effects and damage numbers sit above the portrait, and the toast sits above the page.

## Shapes

The arena radius is 20 px, becoming 14 px on phones, with an inset frame. Panels use `--r:16px`, becoming 12 px on phones. Neutral controls use 7 px corners; the main action and plaques use 8 px. The HP rail and end caps use 3 px corners. Medal ranks are hexagonal, and small gold diamonds connect section headings to the engraved-ring motif.

The plaque frame, inset line and original square SVG image remain distinct layers. The source returned by `bossSvg` / `tokenURI` is never rewritten; the arena retains its existing circular portrait mask.

## Components

| Pattern | Source | Behavior and variants |
| --- | --- | --- |
| Wallet row | `.wallet`, `#wBtns`, `#wState` | Existing EIP-6963 / injected-wallet discovery and wallet-app links; outlined gold Connect control; named choices, pending, cancellation, wrong-chain and connected states |
| Buttons | `.btn`, `.primary`, `.charge`, `.done` | 44 px minimum secondary targets; red full-width main action; gold trophy claim; teal charged state; visible disabled styling; pointer hover and 3 px keyboard focus |
| Arena | `.arena`, `.stage`, `.scene`, `.rune-ring` | Illustration scales without moving the app’s element IDs or altering contract artwork |
| Hamster | `.hamster .wheelspin`, `.legs` | Detailed helmet, plume, cheeks and whiskers; wheel/legs animate only under `.arena.running` |
| HP | `#hpBar`, `#hpFill`, `#hpGhost` | Existing progress semantics; red health, exposed gold hatching for incoming damage; metal end caps and subtle sheen |
| Statistics | `.stats`, `.stat` | Open aligned columns, stable numeric widths, two columns at the smallest width |
| Leaderboard | `.tablebox`, `#board`, `.rank`, `.tier` | Right-aligned numeric columns; medals/glow for ranks 1–3; address links and all columns remain available on a phone |
| Log | `#feed` | Open rows, quiet separators, 44 px transaction links; existing event text/icons unchanged |
| Trophies | `#hall .card`, `.fate`, `#hallMore` | Framed gold fallen plaques, subdued fled plaques, original contract images; eligible/claimed states; full-row older-boss control |
| Toast | `#toast` | Existing polite live status and dismissal behavior; new decorative information icon, wrapping, safe-area inset and bounded width |

Motion is opt-in under `prefers-reduced-motion: no-preference`: gentle 600 ms panel and stage/information entrances (information delayed by 80 ms), a 5 s portrait bob, low-opacity fog/embers and small torch flickers. The wheel spins in 1.2 s while running; legs move in 250 ms. A hit restarts a 340 ms arena shake, slash and 500 ms spark burst. Existing 1.6 s damage numbers remain in `#pops`.

The second script only observes portrait classes and sets two scenery CSS variables. Mouse parallax is bounded to a few pixels and requires a fine mouse pointer. Touch and reduced motion disable it, including when preferences change. Reduced motion removes all running animations; base content remains visible. Forced-colors mode preserves borders and the system focus color.

## Do’s and Don’ts

- Reuse the existing tokens, `.wrap`, `.panel`, `.phead` and six type steps for future supporting content.
- Keep the arena’s main action prominent and the 390 px first screen compact.
- Pair state color with the existing written status, fate or action label.
- Keep table overflow inside `.tablebox`, and leave its accessible name and keyboard focus intact.
- Add visual effects as decorative siblings; `renderBoss()` replaces the contents of `#bossArt`.
- Preserve the contract SVG payloads, application configuration and transaction code. The supplied eight advisories are the only changes to the first script.
- Keep any future animations inside the motion media query. Never make content visibility depend on animation code.

Design guidance: Jakub Krehel’s [Better Interface](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface), MIT. Documentation method: Paul Bakaus’s [Impeccable](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md), Apache-2.0. The pinned guidance was applied to this implementation; the corresponding [license texts](artifacts/design-guidance-LICENSE.txt) are retained separately from the site’s code.
