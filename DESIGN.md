# DESIGN.md — Read the Room ("X-ray" direction)

The locked visual system. Source of truth for the app, landing, and extension.
Implemented as Tailwind v4 `@theme` tokens in `app/globals.css`. If a screen
contradicts this file, the screen is wrong.

## The one thing to remember
> "It feels like x-ray vision for a confusing text — the calm surface is what they
> said, and underneath is what they actually meant."

## Aesthetic thesis
**X-ray.** The everyday interface is light, warm, and calm (the *surface* — what was
said). The hidden meaning is revealed in a deep-plum panel that reads like seeing
*through* the message (the *subtext* — what was meant). Drama is spent in exactly one
place: the reveal. Everything else stays quiet and accessible.

### Why this, not the default
Anthropic's `frontend-design` skill names "warm cream + serif + terracotta" as
AI-default look #1 (our old direction). This escapes it: a warm-neutral (not cream)
surface, a grotesque (not serif) display, a plum reveal (not a near-black page), and
an orchid-rose accent (not terracotta). The reveal motif is grounded in the subject —
decoding hidden meaning — so it reads as a choice, not a template.

### Anti-slop guardrails
- No cream/terracotta. No near-black page + acid accent. No broadsheet hairline grid.
- Plum is a *reveal layer*, never the page background. The page stays light/warm.
- Spend boldness once (the reveal). Keep read-outs quiet.

## Typography
- **Schibsted Grotesk** (display) — headlines, the decoded meaning. A characterful
  grotesque, deliberately not Inter/Roboto/Arial/Space Grotesk/Fraunces.
- **Atkinson Hyperlegible** (body/UI) — everything else. Drawn for legibility
  (low-vision origin), so it doubles as the dyslexia-accessibility font.
- Scale tokens: `--text-meaning`, `--text-h1`, `--text-display` (fluid). Eyebrows:
  0.7rem / 700 / 0.16em / uppercase.

## Color (hex tokens)
Surfaces (warm neutral):
- `--color-paper` #ECEAE6 · `--color-paper-raised` #FFFFFF · `--color-paper-sunk` #E3DFD9
- `--color-ink` #262329 · `--color-ink-soft` #5F5A63 · `--color-ink-faint` #8B8690
- `--color-line` #DED9D3

The reveal (hidden meaning):
- `--color-plum` #3A2A4D · `--color-plum-raised` #46355A
- `--color-on-plum` #F4EFF7 · `--color-on-plum-soft` #C8BCD2

Accent (the decode highlight):
- `--color-rose` #C9608F · `--color-rose-ink` #A23A6B (AA on light) · `--color-rose-soft` #F4DDE8

Semantic read-outs (temperature, not grades): `--color-calm` #3F7D66 ·
`--color-caution` #BF8526 · `--color-heat` #B8443F. Map confidence/upset/urgency.

## Signature
The **reveal**: a normal message (light chat bubble) → a dashed rose scan-line
("reading through ↓") → a deep-plum panel (`.reveal-scan` adds a faint scanline
texture) holding the decoded meaning in Schibsted + tone chips. Used as the landing
hero and as the decode result in the app.

## Motion
`rise` on result blocks; `swipe` highlighter under a decoded phrase; streaming rose
caret in replies. Transform/opacity/color only. Honor `prefers-reduced-motion` and the
in-app reduced-motion toggle.

## Accessibility (first-class)
Atkinson body; dyslexia mode widens spacing + forces sans for headings; high-contrast
mode (white paper, darker ink, darker plum, no grain); visible rose `:focus-visible`
ring; ≥40px targets; never color-alone (upset = word, urgency = dots + label,
confidence = number). Plum reveal keeps AA+ contrast (`on-plum` on `plum`).

## Application
- **App:** light composer → plum reveal of the meaning → light read-outs → reply card.
- **Landing:** Schibsted display hero + the reveal signature; plum privacy band.
- **Extension popover:** condensed reveal, same tokens, ≤360px.
