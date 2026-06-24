# DESIGN.md — Read the Room

The locked visual system. Source of truth for the app, the landing page, and the
browser-extension popover. Implemented as Tailwind v4 `@theme` tokens in
`app/globals.css`. If a screen contradicts this file, the screen is wrong.

## The one thing to remember
> "It feels like a calm friend who finally explains what that message *actually* meant."

Warm, human, trustworthy. The opposite of a cold AI tool or a clinical mental-health
app. Every choice below serves that feeling.

## Aesthetic thesis
**Warm editorial** — a thoughtful print magazine meets a calm journaling app. Generous
whitespace, a real serif for the emotional "meaning" moments, an honest humanist sans
for everything functional, paper texture instead of flat fills. Confident, not loud.

### Anti-slop guardrails (do not ship these)
- No Inter / Roboto / Arial / Space Grotesk as display type.
- No purple or blue→pink gradients. No glowing "AI" gradient blobs.
- No uniform 3-column icon-card grid. Compose editorially; vary rhythm.
- Not centered-everything. Use an asymmetric, left-anchored reading column.
- No pure-black text on pure-white. Warm ink on warm paper.

## Typography
Two families, one job each:
- **Fraunces** (variable serif) — the *meaning*: hero headline, the decoded "what they
  really mean," landing display. Use optical size; lean into its softness. Italics for
  emphasis words ("really").
- **Atkinson Hyperlegible** (sans) — all UI, labels, body, buttons, replies. Chosen
  because it is *designed for legibility* (low-vision origin), so it doubles as the
  dyslexia-accessibility font. No separate "accessible mode" font swap needed for body.

### Type scale (rem, fluid where it earns it)
| Token | Size | Use |
|---|---|---|
| `--text-eyebrow` | 0.7rem / 700 / 0.16em tracking / uppercase | section labels |
| `--text-body` | 1rem | body, replies |
| `--text-lg` | 1.125rem | emphasis |
| `--text-meaning` | clamp(1.5rem, 1.1rem+1.6vw, 1.9rem) serif | the decoded meaning |
| `--text-h1` | clamp(2rem, 1.4rem+3vw, 3rem) serif | page headline |
| `--text-display` | clamp(2.75rem, 1.6rem+5vw, 5rem) serif | landing hero |

Line-height: 1.2 for serif display, 1.5 body, 1.75 in dyslexia mode.

## Color (oklch — perceptual, easy to keep on-hue)
Surfaces (warm paper, never gray):
- `--color-paper` 98.2% — app background
- `--color-paper-raised` 96.3% — cards
- `--color-paper-sunk` 94.6% — wells, tracks
- `--color-ink` 28% — primary text (warm near-black, ~12:1 on paper)
- `--color-ink-soft` 46% — secondary text (AA on paper)
- `--color-ink-faint` 62% — labels/captions (large/non-essential)
- `--color-line` 89% — hairline borders

Accents (semantic, not decorative):
- `--color-terracotta` 60% c0.142 h38 — primary accent: fills, active chips, the live
  cursor, the "what they want" callout. **Fills/large text only.**
- `--color-terracotta-ink` 47% — accent *text on paper* (passes AA for small text).
- `--color-sage` 58% h158 — calm/positive: high confidence, "not upset."
- `--color-amber` 78% h74 — caution/medium: medium confidence, "probably."
- `--color-flag` 52% h30 — alert: "upset = yes," crisis banner accent. Text-safe.

Rule: green/amber/red here read as *temperature*, never as "good/bad grades." They map
to calm → caution → heat.

## Space & rhythm
- Base unit 4px. Card padding 24–32px. Screen gutter 20px mobile, reading column max
  `42rem` (672px) — a *book column*, not a full-width app.
- Vertical rhythm between result blocks: 12px (tight, related) vs 24px (section break).
  Deliberately uneven — editorial, not a uniform grid.

## Elevation
Two soft, warm shadows only (no hard drop shadows):
- `--shadow-soft` — resting cards.
- `--shadow-lift` — hover / the active reply card.
Borders do most of the separation; shadow is a whisper.

## Motion
- Reveal: `rise` (12px up + fade, 0.5s, ease-out-expo) on each result block.
- Streaming: a 2px terracotta caret pulse while a reply types in.
- Transitions on `transform`/`opacity`/color only. 150–300ms.
- **Honor `prefers-reduced-motion` and the in-app reduced-motion toggle** — both kill
  animation to ~0ms.

## Accessibility (first-class, it's the product)
- Body font is already hyperlegible; dyslexia mode widens letter/word spacing + line
  height and forces the sans for headings too.
- High-contrast mode: pure white paper, darker ink, drop the grain.
- All interactive elements get a visible `:focus-visible` ring (terracotta, 2px offset).
- Target size ≥ 40px for chips/buttons. `aria-pressed`/`role=tab` on toggles.
- Never rely on color alone: upset uses a word (Yes/Probably/No), urgency uses dots +
  label, confidence shows a number.

## Application notes
- **App:** left-anchored reading column, input card → result composition → reply card.
- **Landing:** Fraunces `--text-display` hero, one terracotta accent, a live demo, the
  privacy + accessibility promise. Same tokens, more air.
- **Extension popover:** condensed result composition, same tokens, max 360px wide.
