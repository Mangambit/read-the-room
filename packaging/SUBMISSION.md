# Devpost submission kit — Read the Room

**Hackathon:** Youth Code x AI · **Track 03 — AI That Actually Helps People**
**Deadline:** Jun 27, 2026 @ 11:30pm EDT
**Submit at:** https://youth-code-x-ai-29376.devpost.com/ → "Submit a project"

Everything below is copy-paste ready. Fill the Devpost form field-by-field.

---

## Links to paste
- **Live app:** https://read-the-room-phi.vercel.app
- **Source code (public):** https://github.com/Mangambit/read-the-room
- **Demo video:** _upload `packaging/Read-the-Room-Demo.mp4` to YouTube (unlisted is fine) and paste the link_

## Project name
Read the Room

## Tagline / elevator pitch (≤ ~200 chars)
The friend who finally explains what they actually meant. Paste any confusing message and get the tone, the hidden ask, and a reply — in plain language. Built for neurodivergent minds; useful for everyone.

## Tracks / category
Track 03 — AI That Actually Helps People

---

## Inspiration
A lot of people — especially if you're autistic, ADHD, anxious, or just tired — can read the literal words of a text and still have no idea what the person *meant*. "k." "Per my last email." "Do whatever you want." Subtext isn't automatic for everyone, and getting it wrong costs you a whole evening of overthinking. We wanted a calm, private tool that does the part your brain stalls on: reading between the lines, and then helping you respond.

## What it does
Paste a message (or a screenshot of one) and Read the Room shows you, in plain language:
- **What they actually mean** — the subtext, not a thesaurus.
- **The "tells"** — it highlights the exact words that gave the tone away, so you learn the pattern.
- **Are they upset with *you*?**, how sure it is, what they want, and how urgent it is.
- **A reply, drafted for you** — Warm, Professional, or Firm, with goals like "set a boundary" or "smooth it over." One tap to copy.
- **Check my reply** — paste something *you're* about to send and it tells you how it'll land, plus a kinder way to say the same thing.

It also adapts to your age group (the way a 13-year-old and a 30-year-old text is very different), runs an accessibility menu (dyslexia-friendly font, high contrast, reduced motion), and has a crisis safety net — if a message sounds genuinely heavy, it steps back and points to real support instead of a glib reply. There's a **Chrome extension** too: select text on any page (Gmail, Discord, Outlook) and decode it inline.

## How we built it
- **Next.js (App Router) + React + TypeScript** on **Vercel**, **Tailwind** for the design system.
- A **provider-agnostic LLM adapter** with a fallback **chain** (Cerebras `gpt-oss-120b` → Groq Llama → a hand-written demo-safe mode), so a capped or slow key transparently rolls to the next and the demo can never hard-fail.
- **Structured output** validated with **Zod** + a tolerant JSON parser, streaming replies, per-IP rate limiting, and strict privacy: messages are processed and discarded, never stored or logged.
- **Vision** (screenshot decoding) via an OpenAI-compatible image path. Accessibility built to **WCAG 2.2 AA** (contrast-checked tokens, roles, focus management). **MV3 Chrome extension** sharing the same backend and design tokens.

## Challenges we ran into
- **Subtext quality** is the whole product — generic "this seems negative" is useless. It took heavy prompt design, few-shot examples, and a "restraint" rule so rewrites stay proportionate (no "thanks so much!!!" when "thanks" is what fits).
- **Register by age** — LLMs don't naturally shift how they text for a 14-year-old vs. an adult; we researched real texting patterns per age band and encoded them.
- **Never dead-ending** — free LLM tiers hit caps. The fallback chain + demo-safe mode means the live link always responds.

## Accomplishments we're proud of
A genuinely *kind* tool that works end-to-end, looks intentional (a distinctive "X-ray" reveal, not a template), is accessible by default, handles crisis with care, and ships as both a web app and a browser extension — all on a free stack, deployed live.

## What we learned
The hard part of an "AI that helps people" isn't the model call — it's restraint, safety, and tone. The accessibility and crisis-handling work mattered as much as the decode quality.

## What's next
Voice-note decoding, a Firefox/Safari build, and an optional on-device model for full privacy.

## Built with
`next.js` `react` `typescript` `tailwindcss` `vercel` `cerebras` `groq` `llama` `zod` `chrome-extension` `manifest-v3`

---

## Final submission checklist
- [x] Live app deployed & verified (real reads, no login)
- [x] Source repo public: github.com/Mangambit/read-the-room
- [x] Demo video produced: `packaging/Read-the-Room-Demo.mp4` (0:89)
- [ ] **Upload the video to YouTube** and paste the link into Devpost
- [ ] Add a screenshot/thumbnail (use `packaging/screenshots/` or a frame from the video)
- [ ] Paste the fields above into the Devpost project form
- [ ] **Click Submit before Jun 27, 11:30pm EDT**

> Note: the actual Devpost submission and YouTube upload have to be done from your
> account — I can't log in as you. Everything is drafted so it's a ~5-minute paste-and-submit.
