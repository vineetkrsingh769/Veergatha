# Design audit — `client/src`

Measured 2026-09-06 against `main`. This is the inventory Night 3 works from.

Re-run any figure in this document with the commands in [How to re-measure](#how-to-re-measure).

---

## Headline

**The token system that exists has zero consumers.** Three separate palettes were
written and none of them is wired to anything:

| Token system | Location | Consumers |
| --- | --- | --- |
| `@theme` saffron/tiranga ramps | `client/src/index.css` | **0** — no `text-saffron-*` or `bg-tiranga-*` anywhere |
| `:root` custom properties | `client/src/index.css` | **0** in JSX; even `body` re-hardcoded the hex |
| `THEME` object | `client/src/lib/constants.js` | **0** — dead export |

So this audit is not documenting drift away from a system. There was no system; every
screen decided its own styling inline.

**376 hardcoded colour decisions** across `pages/` and `components/`:

| Category | Count | Where it goes |
| --- | --- | --- |
| Hex literals | 115 | Semantic tokens + ramps |
| Tailwind default palette (`stone`/`rose`/`emerald`/`amber`) | 231 | `parchment` / `ink` ramps + state triad |
| `white` / `black` utilities | 29 | `raised` / `sunken` — the palette rule forbids pure white |
| `rgba()` literal | 1 | `SpotlightCard` spotlight colour |

The 231 default-palette utilities are the part most easily missed. Fixing only the 115 hex
literals would leave **every neutral in the archive** — all surfaces, all borders, all
secondary text — still untokenised.

> **Migrated on Night 3.** All 376, plus the type scale, in ~500 replacements across 21
> files. Every count in [How to re-measure](#how-to-re-measure) now returns 0. Two tints were
> adjusted to clear WCAG AA — see [Contrast](#contrast-outcome-night-3).

---

## Part 1 — Component inventory

### REUSABLE — token pass only

| File | Exports | Note |
| --- | --- | --- |
| `components/ui/PageHeader.jsx` | `PageContainer`, `PageHeader`, `Section` | Correctly leaves the 1080px floor to the shell |
| `components/ui/Badge.jsx` | `StatusBadge`, `VerificationBadge`, `AwardBadge` | Content-integrity critical: unknown status renders "Unrecorded" rather than defaulting to martyrdom wording. Do not weaken this. |
| `components/ui/Field.jsx` | `Field`, `SelectField`, `Button` | Shared `CONTROL` string; `useId` wiring is correct |
| `components/ui/Pagination.jsx` | `Pagination` | Consumes the `{ total, page, limit, pages }` API envelope; self-hides at one page |
| `components/ui/index.js` | barrel | — |
| `components/admin/ChangePassword.jsx` | default | — |
| `components/admin/MediaUpload.jsx` | default | — |
| `hooks/useApi.js`, `hooks/useDebounced.js` | — | No styling |
| `lib/api.js`, `lib/auth.js`, `lib/format.js` | — | No styling |
| `pages/MemorialsList.jsx`, `pages/MemorialDetail.jsx` | — | 1 hex each |
| `pages/WarsList.jsx`, `pages/WarDetail.jsx` | — | 1 hex each |
| `pages/Gallery.jsx` | — | 6 hex, 15 palette utilities |
| `pages/AdminLogin.jsx`, `pages/AdminDashboard.jsx` | — | Heaviest palette use (31 lines in the dashboard) but structurally sound |

### NEEDS-REBUILD — scheduled by a later night

| File | Night | Why |
| --- | --- | --- |
| `components/Layout.jsx` | 4, 5 | Header and footer rebuild. **Keep two things:** the `grid-cols-[1fr_auto_1fr]` header grid and the `after`-underline active marker — both fix bugs that were diagnosed and repaired. A `border-bottom` on the active item adds height to only that link and shifts the whole row on navigation. |
| `components/ui/Detail.jsx` | 6 | `DetailPanel`, `MetaGrid`, `MetaItem`, `PersonLink`, `PersonGrid` are the profile-header primitives — extend, do not replace |
| `components/ui/RecordCard.jsx` | 10 | Card grid becomes a dense list for recipients. Still used by `MemorialsList` and `WarsList`, so it survives — the martyr path stops using this shape. |
| `components/ui/States.jsx` | 12 | Needs a skeleton variant beside `Loading`; `AsyncBoundary` already threads `onRetry` |
| `components/reactbits/SpotlightCard.jsx` | 21 | Motion audit. Also carries a stray `hover:border-amber-600/50` — amber on a saffron card, left over from the upstream ReactBits template. |
| `components/reactbits/BlurText.jsx` | 21 | Motion audit; used once, in `Home.jsx` |
| `pages/Home.jsx` | 14–16 | Heaviest file in the audit (21 hex). Old layout is retired on Night 16. |
| `pages/MartyrsList.jsx` | 10, 11 | See duplication note below |
| `pages/MartyrDetail.jsx` | 6–9 | Profile header, citation, narrative, provenance, related entries |
| `pages/Search.jsx` | 12 | States and relevance |

### DELETE

| Target | Why | When |
| --- | --- | --- |
| `THEME` object in `lib/constants.js` | Dead export, zero consumers. A fourth palette source waiting to be picked up by mistake. | Night 3 |
| `:root` block in `index.css` | Zero consumers. Now aliased to the real tokens so a stray reference cannot break; delete once Night 3 confirms nothing reads it. | Night 3 |
| `cn()` in `lib/utils.js` | Dead export, zero consumers — but `clsx` + `tailwind-merge` are genuinely useful for the conditional classes Nights 10–12 will need. **Keep the helper, start using it**, or drop it and remove both dependencies. Do not leave it dead. | Night 3 |

### Duplication

`pages/MartyrsList.jsx` hand-rolls its own `SpotlightCard` markup (lines ~150–182) instead
of using `RecordCard`, which is a near-identical component built for exactly this. The two
have already drifted — the inline copy uses `space-y-4`, `RecordCard` uses `gap-4`. Night 10
replaces the recipient card with a list, so this resolves itself; do not spend effort
reconciling them first.

---

## Part 2 — Colour

### Hex literals — 115 total

| Value | Count | Replacement token |
| --- | --- | --- |
| `#D96B27` | 52 | `accent` (`saffron-600`) |
| `#C25016` | 20 | `accent-deep` (`saffron-700`) |
| `#1E431B` | 18 | `tiranga-700` |
| `#1A241A` | 12 | `ink` |
| `#FAF7F2` | 9 | `surface` |
| `#2E5E2A` | 3 | `tiranga-600` |
| `#163319` | 1 | `tiranga-700` — a one-off tint with no other use; consolidate |

By file, heaviest first:

| File | Hex | Palette utils |
| --- | --- | --- |
| `pages/Home.jsx` | 21 | 20 |
| `components/Layout.jsx` | 11 | 11 |
| `pages/AdminDashboard.jsx` | 10 | 31 |
| `pages/MartyrDetail.jsx` | 8 | 15 |
| `components/ui/Detail.jsx` | 8 | 10 |
| `pages/Gallery.jsx` | 6 | 15 |
| `pages/MartyrsList.jsx` | 5 | 6 |
| `components/ui/RecordCard.jsx` | 5 | 2 |
| `components/admin/MediaUpload.jsx` | 4 | 11 |
| `components/ui/PageHeader.jsx` | 3 | 2 |
| `components/admin/ChangePassword.jsx` | 3 | 7 |
| `pages/Search.jsx` | 2 | 3 |
| `components/ui/Field.jsx` | 2 | 7 |
| `components/ui/States.jsx` | 1 | 9 |
| `components/ui/Badge.jsx` | 1 | 6 |
| `pages/AdminLogin.jsx` | 1 | 3 |
| `pages/WarDetail.jsx` | 1 | 0 |
| `pages/MemorialDetail.jsx` | 1 | 0 |
| `components/ui/Pagination.jsx` | 0 | 3 |
| `components/reactbits/SpotlightCard.jsx` | 0 | 1 |

For exact line numbers, run the grep in [How to re-measure](#how-to-re-measure) — reproducing
115 line references here would go stale on the first edit.

### Tailwind default palette — 231 total

| Family | Count | Currently carrying | Replacement |
| --- | --- | --- | --- |
| `stone` | 174 | Every surface, border, and secondary text colour in the archive | `parchment-*` (surfaces, rules) and `ink-*` (text) |
| `rose` | 34 | Errors, and `StatusBadge` "Fell in Action" | `danger` / `danger-bg` / `danger-rule` |
| `emerald` | 15 | Success, "verified", "Survived" | `success` / `success-bg` / `success-rule` |
| `amber` | 8 | "In review", plus the stray `SpotlightCard` hover | `warning` / `warning-bg` / `warning-rule` |

Highest-frequency single utilities: `border-stone-300` (40), `text-stone-600` (26),
`text-stone-700` (23), `text-stone-500` (23), `text-stone-400` (15).

`text-stone-400` is used for **icons**, not text — the replacement token `faint` (`#8B968A`)
sits at roughly 2.9:1 on the parchment ground and **fails AA for text**. Keep it to icons and
disabled controls. If Night 3 finds it applied to real text, that text moves to `muted`.

### White and black — 29 total

`bg-white` ×8, `bg-white/70` ×4, `bg-white/90` ×3, `bg-white/85` ×3, `bg-white/80` ×3,
`bg-white/60` ×2, `text-white` ×2, plus 4 `black/*` gradient stops in `Home.jsx`.

The palette rule is *never pure white*. `bg-white` and `text-white` are direct violations;
they become `raised` (`#FDFBF7`). The translucent `white/NN` variants are a different
problem — they let the parchment ground bleed through at six different opacities, which is
why panels look inconsistent from page to page. All six collapse to `raised`.

### rgba

`components/reactbits/SpotlightCard.jsx` — `rgba(217, 107, 39, 0.14)` is `#D96B27` in
disguise, so grep for hex misses it. Becomes `--color-accent` at 14%.

---

## Part 3 — Typography

**No webfont was loaded.** `index.css` named Cormorant Garamond and Inter, but there was no
`<link>` and no `@font-face` anywhere in the project, so the site had never rendered in
either — it fell back to Georgia and system-ui.

> **Resolved on Night 2.** Source Serif 4, Inter and IBM Plex Mono are now self-hosted via
> `@fontsource`, imported in `main.jsx`. The root cause of the silent fallback is worth
> remembering: fontsource declares the variable families as `'Inter Variable'` and
> `'Source Serif 4 Variable'`, so a token naming plain `"Inter"` matches nothing and fails
> without any error. Cormorant Garamond was dropped — it is a display face whose delicate
> high-contrast strokes break up at the 17px `prose` size Nights 8 and 17 need.

Sizes in use — 11 distinct values for what should be about 7 roles:

| Value | Count | New step |
| --- | --- | --- |
| `text-xs` (12px) | 45 | `label` |
| `text-sm` (14px) | 26 | `body` |
| `text-[11px]` | 11 | `caption` |
| `text-[10px]` | 9 | `caption` |
| `text-lg` (18px) | 9 | `prose` / `title` |
| `text-xl` (20px) | 6 | `title` |
| `text-3xl` (30px) | 3 | `heading` |
| `text-base` (16px) | 2 | `body` / `prose` |
| `text-5xl` (48px) | 1 | `display` |
| `text-4xl` (36px) | 1 | `heading` |
| `text-[3.15rem]` (50.4px) | 1 | `display` |

`text-[10px]` and `text-[11px]` are used interchangeably for the same kind of metadata —
`Badge.jsx` sets badges at 10px, `PageHeader.jsx` sets eyebrows at 11px, `MetaItem` uses 10px
and `Field` hints use 11px. Two sizes one pixel apart is drift, not a distinction. Both
collapse into `caption` (11px).

Faces: `font-display` ×23, `font-mono` ×4, `font-sans` ×1 (the rest inherit from `body`).
The four `font-mono` uses are already the right instinct — three of them mark gazette
references and per-field source names in `MartyrDetail.jsx`, which is exactly the role
Night 7 formalises.

---

## Part 4 — Spacing and radii

**Spacing is not the problem colour is.** Only seven arbitrary sizing values exist, and
six are legitimate one-off viewport heights (`h-[90vh]` ×2, `h-[88vh]`, `h-[620px]`,
`h-[60vh]`, `h-[340px]`, `h-[100px]`) for hero and media blocks. The seventh is
`min-w-[1080px]`, which appears **exactly once** — on the Layout shell, deliberately, so
header, main and footer cannot disagree about width. **Do not duplicate or remove it.**

What is missing is named rhythm: `PageContainer` hardcodes `px-8 py-8`, `DetailPanel` uses
`p-7`, and nothing states that these are the same decision. Night 5 adopts the new
`gutter` / `band` / `panel` / `stack` / `section` tokens.

Radii sprawl across six values for an archive that needs three:

| Current | Count | New |
| --- | --- | --- |
| `rounded-lg` | 16 | `control` |
| `rounded-xl` | 11 | `panel` |
| `rounded-full` | 10 | `rounded-full` (pills only — keep) |
| `rounded` | 9 | `control` |
| `rounded-2xl` | 6 | `panel` |
| `rounded-md` | 3 | `control` |

`rounded-2xl` (16px) on a memorial archive is a consumer-app radius. The new `frame`
(8px) is the largest the design allows.

---

## Part 5 — What Night 1 added

All additive. No Tailwind default was cleared and no existing token changed value, so
nothing in the current UI shifted.

- **`parchment-*`** (5 steps) — warm surfaces and rules, to retire `stone-*`
- **`ink-*`** (4 steps) — green-tinted text, so body copy sits in the same family as the
  tiranga headings instead of fighting them
- **Semantic aliases** — `ink`, `muted`, `faint`, `surface`, `raised`, `sunken`, `rule`,
  `rule-strong`, `accent`, `accent-deep`
- **State triad** — `danger` / `success` / `warning`, each with a `-bg` and `-rule`
- **Type scale** — 7 steps, `caption` → `display`, each with its own line height
- **Spacing** — `gutter`, `band`, `panel`, `stack`, `section`
- **Radii** — `control`, `panel`, `frame`
- **Motion** — `--ease-archive`, `--duration-quick`, `--duration-calm` (unused until Night 21)

### One naming constraint, learned the hard way

In Tailwind v4 a `--color-x` and a `--text-x` **both generate `text-x`**. A semantic colour
may therefore never reuse a type-scale name. `--color-body` and `--color-heading` were both
drafted and both removed for this reason. Secondary text is `text-ink-700`; headings are
`text-tiranga-700`.

The same trap applies to any future token: check the utility name, not just the variable
name, before adding one.

### Rendering the tokens

`/style-guide` renders all of it — colour, type, spacing, radii, motion. It is registered as
a lazy route in `App.jsx` and **deliberately absent from `NAV_ITEMS`**: reachable, not
advertised.

Its swatches read their own resolved colour via `getComputedStyle` rather than repeating hex
strings, so a label there cannot drift from the token it describes. Note that every class
name on that page is written out in full — Tailwind scans source text for candidates, so a
constructed string like ``bg-${token}`` generates no CSS at all and renders blank.

---

## Contrast outcome (Night 3)

Auditing all 26 text/background pairs against WCAG AA turned up **7 genuine failures**, all
on the accent. Fixed by adjusting the tints, not with per-element overrides:

| Token | Was | Now | Why |
| --- | --- | --- | --- |
| `saffron-700` / `accent-deep` | `#C25016` | `#BE4E16` | 4.41:1 on parchment — just under the 4.5 bar |
| `saffron-800` | *(new)* | `#A24212` | Hover step below the button ground |
| `ink-300` / `faint` | `#8B968A` | `#859084` | 2.88:1 — missed even the 3:1 non-text minimum |

**The brand saffron `#D96B27` is unchanged.** It measures 3.23:1 on parchment, which is fine
for borders, icons and fills but fails AA for text — and it was being used as text 53 times.
So the rule is now:

- `accent` (`saffron-600`) — borders, icons, fills, decoration. Never text.
- `accent-deep` (`saffron-700`) — accent text, and any solid accent ground carrying text.

All 53 `text-accent` uses moved to `text-accent-deep`, and the two solid accent buttons
(the homepage CTA and `Button` variant `primary`) moved from `bg-accent` to `bg-accent-deep`
with a `saffron-800` hover.

### One hazard this created

Consolidating two distinct hardcoded colours onto a single token can silently turn a hover
into a no-op — `hover:bg-white` and `bg-white/90` both became `bg-raised`. Four were
introduced and fixed (`Layout.jsx`, `Detail.jsx`, `Home.jsx` ×2). Re-check after any future
consolidation:

```bash
# flags `X-tok ... hover:X-tok` on the same element
grep -rnoE '(bg|text|border)-([a-z0-9-]+)[^"]*hover:\1-\2' client/src/
```

## How to re-measure

```bash
cd client/src

# Hex literals by value
grep -rhoiE '#[0-9a-f]{6}\b' pages components | tr 'a-f' 'A-F' | sort | uniq -c | sort -rn

# Hex literals with file and line
grep -rnoiE '#[0-9a-f]{6}\b' pages components | sort -t: -k1,1 -k2,2n

# Tailwind default-palette utilities by family
grep -rhoE '\b(stone|gray|slate|zinc|neutral|emerald|rose|amber|sky|red|green|blue)-[0-9]+' \
  pages components | sed 's/-[0-9]*$//' | sort | uniq -c | sort -rn

# White and black
grep -rhoE '\b(bg|text|border|from|to|via)-(white|black)(/[0-9]+)?' pages components \
  | sort | uniq -c | sort -rn

# Type sizes
grep -rhoE '\btext-(xs|sm|base|lg|xl|[2-7]xl)\b|text-\[[^]]+\]' pages components \
  | sort | uniq -c | sort -rn

# Radii
grep -rhoE '\brounded(-[a-z0-9]+)*\b' pages components | sort | uniq -c | sort -rn

# The desktop lock — must always be 0
grep -rcoE '\b(sm|md|lg|xl):' .
```

Every count in this document should reach zero over Nights 2–3, except `min-w-[1080px]`
(exactly 1, on the shell) and `rounded-full` (pills).
