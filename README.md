# Read the Room

**Paste a confusing message. See what they *really* mean.**

Read the Room is an x-ray for the messages that ruin your night. Paste a clipped
"ok.", a "fine, do whatever," or a passive-aggressive email, and it tells you what
the person *actually* means underneath the words: the real meaning, the tone, whether
they're upset *with you*, what they want, and how urgent it is — then it drafts a reply
in your voice. Built for neurodivergent people and anyone who overthinks the reply.

> Youth Code x AI · Track 03 (*AI That Actually Helps People*)

---

## Why it exists

Reading tone and subtext isn't obvious for everyone. For autistic and ADHD folks — and
honestly for anyone with social anxiety — a vague text can cost a whole evening of
overthinking. Read the Room is the calm, perceptive friend who reads it for you and
tells you, in plain language, what's going on and what to say back. No judgment, no
streaks, no "you should have known."

## What it does

- **Decode** — paste a message (optionally tag who it's from) and get:
  - **What they really mean** — plain English, no jargon
  - **Tone** + **how sure** the read is (a confidence score)
  - **Are they upset with you?** — Yes / Probably / No, with the reason
  - **What they want from you** and the **urgency**
- **Reply** — three ready drafts (Warm / Professional / Firm), streamed live, one-tap copy.
- **Check my reply** — paste *your* draft before you send it and see **how it'll land**,
  what it could be misread as, and a warmer rewrite.
- **A crisis safety net** — if a message sounds genuinely heavy, it gently surfaces real
  support (988) instead of a glib reply. Conservative by design.

## Built to be read

Accessibility is the product, not a setting:

- The entire UI is set in **Atkinson Hyperlegible**, a typeface drawn for legibility.
- One tap for **dyslexia-friendly** spacing, **high contrast**, and **reduced motion**.
- Nothing relies on color alone (upset is a word, urgency is dots + a label, confidence
  is a number).

## Privacy

We never store your messages. Each one is read once to help you, then discarded — no
account, no history, nothing kept on a server. The server never logs message content.

## How the AI works (and how it stays free)

The interesting engineering bit: a **provider-agnostic LLM adapter**. The app talks to
one interface; behind it you can run:

- **Groq** (free, no credit card, very fast) — the live demo
- **Claude** — best quality, for the recorded demo
- **Demo-safe mode** — hand-written canned reads for 6 sample messages, *zero network*

Switching is one environment variable, no app-code change. The model returns a strict
JSON shape (validated with Zod) and a tolerant parser shrugs off markdown fences or
stray prose, so the live demo can't crash on a malformed response. And if the wifi dies
on stage, **demo-safe mode** means the demo still runs perfectly.

## Run it

```bash
npm install
cp .env.example .env.local   # leave LLM_PROVIDER=demo to run with zero keys
npm run dev                  # http://localhost:3000  (app)  ·  /landing (marketing)
```

To use a real model, set `LLM_PROVIDER=groq` and add a free `GROQ_API_KEY` from
[console.groq.com](https://console.groq.com).

```bash
npm test         # unit tests (schema contract + crash-proof parser + demo data)
npm run build    # production build
```

## Tech

Next.js (App Router) · TypeScript · Tailwind v4 · Zod · Groq / Claude / demo adapter.
Design system locked in [`DESIGN.md`](./DESIGN.md). Build plan in
[`PLAN.md`](./PLAN.md).

## Project layout

```
app/            # screens + API routes (decode / reply / presend)
components/     # UI: decode result, replies, pre-send, accessibility, landing
lib/            # llm adapter, schema, prompts, tolerant parser, demo data
packaging/      # demo script, deck, screenshots, design explorations
```

---

Made by Dariush for the Youth Code x AI hackathon.
