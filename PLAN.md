# Build Plan — "Read the Room"

> Youth Code x AI · Track 03 · solo · 4-day window (2026-06-23 → 2026-06-27)
> Source-of-truth spec: `../Battle Plan — Youth Code x AI.md`
> This file is the executable build plan. Optimized to **win a recognition** (track win and/or the separate packaging award) and to be run by an autonomous agent **loop + goal**.

---

## Context — why this, what's at stake

A judge remembers a small thing that works *flawlessly* and made them *feel* something. So the #1 engineering risk is not "too little built" — it's **a live demo that breaks**. Every load-bearing decision below is bent toward: *the demo cannot fail, and the product feels like care, not a toy.*

Two prizes in play, chased simultaneously:
1. **Track 03 win** — a working, emotionally resonant accessibility tool.
2. **Packaging/presentation award** — landing page, demo video, deck, docs. Most reliable win available; we go all-in regardless of code.

---

## ⚠️ Revisions to the kickoff prompt (ultraplan value-add — review these)

These are issues in the original brief I'm flagging *before* code starts. Each has a reasoning. Approve or push back.

| # | Issue in the brief | Revision | Why it matters |
|---|---|---|---|
| **R1** | "Be the brains for now" / vague API plan | A deployed/hosted app **cannot call Claude Code** — it needs a real LLM API. Even *free* tiers need a free key. **Decision: use Groq (free, no credit card, ~instant inference) as the live-demo provider; get one free key (≈2 min).** Anthropic/Claude optional for the recorded video. | Without this nailed down, there is no working demo. Groq removes cost AND is fast enough to feel magical live. |
| **R2** | "Privacy: store nothing" + free Gemini | **Google Gemini free tier uses your data to improve Google products** — that *contradicts* a privacy promise. **Use Groq for the live path; word the privacy copy precisely:** "We never store your messages on our servers," + a transparent one-liner that the AI model processes them. Don't overclaim. | Industry-pro judges *will* probe the privacy claim. Honesty is a credibility win; overclaiming is a disqualifier. |
| **R3** | "Streaming structured output" | **Do NOT stream the structured decode JSON** — partial JSON is unparseable and fragile live. Render the decode in one shot behind a delightful loader. **Stream only the free-text reply drafts.** | Streaming half-formed JSON is the classic live-demo crash. One-shot parse + great loader is both safer and feels fast. |
| **R4** | (not in brief) | **Add a "demo-safe mode":** pre-baked canned responses for ~6 curated sample messages, behind a flag. The live demo and the video can run with **zero network dependency.** | This is the single biggest insurance policy for winning. If wifi/API dies on stage, the demo still runs perfectly. |
| **R5** | "Extension works on Gmail/Discord" | **Generic `window.getSelection()` overlay first** (works on most pages). Defer site-specific Gmail/Discord DOM hacks. Extension stays **SHOULD**, built *after* the core app + packaging are done. | Gmail/Discord are hostile SPAs (shadow DOM). Chasing them early risks burning a day for a fragile result. Generic selection demos just as well. |
| **R6** | (implicit) | **Tolerant model-output parsing:** strip ``` fences, validate with zod, repair/fallback on bad JSON — never let a malformed response crash the UI. | Free models occasionally wrap JSON in markdown or add prose. Defensive parsing = no live crash. |
| **R7** | "parallelize extension/landing/deck" | **Strict priority for the loop:** always keep a submittable artifact. Order: **core Decode+Reply web app → packaging (video/deck/landing) → pre-send + a11y + safety net → extension → deploy.** Parallelize *within* a tier, not across the MUST boundary. | If time runs out, we must already have a winning core + packaging. The extension is upside, not the foundation. |
| **R8** | "crisis safety net" | Safety net is **non-blocking, conservative, non-clinical**: a gentle banner ("If you're going through something, you deserve support" + 988 / generic resources), never replaces the decode, errs toward *not* flagging normal venting. Documented limitations. | False positives feel patronizing; missing a real crisis is an ethical failure. Conservative + non-blocking is the safe, judge-respected design. |

**Runtime decisions deferred to execution:** (a) Groq vs Gemini final pick — test latency/quality first; (b) whether Youth Code x AI sponsors hand out API credits — check rules/Discord; (c) which page to demo the extension on.

**Deliberately NOT building (so it isn't quietly added):** accounts/login, message history/persistence, payments, mobile app, voice I/O, multi-language (English only v1), team features.

---

## Architecture (load-bearing pieces in **bold**)

```
read-the-room/
├── app/                      # Next.js App Router
│   ├── page.tsx              # the single polished screen (Decode/Reply/Pre-send)
│   ├── layout.tsx            # fonts, a11y providers, metadata
│   ├── landing/page.tsx      # marketing landing (packaging award)
│   └── api/
│       ├── decode/route.ts   # POST → structured decode (one-shot)
│       └── reply/route.ts    # POST → streamed reply drafts
├── lib/
│   ├── llm/
│   │   ├── adapter.ts        # ★ provider-agnostic interface
│   │   ├── groq.ts           # ★ free live-demo provider
│   │   ├── gemini.ts         # optional free provider
│   │   ├── anthropic.ts      # optional best-quality (recorded video)
│   │   └── index.ts          # env-var provider selection
│   ├── schema.ts             # ★ zod schemas: DecodeResult, ReplyDrafts
│   ├── prompts.ts            # ★ decode/reply/pre-send/safety prompt templates
│   ├── parse.ts              # ★ tolerant JSON extraction + repair
│   ├── safety.ts             # crisis detection (conservative)
│   └── demo-data.ts          # ★ canned responses for demo-safe mode
├── components/               # design system (tokens, cards, chips, meters)
├── extension/               # MV3 Chrome extension (SHOULD tier)
├── packaging/               # video script, deck outline, screenshots
├── .env.example             # LLM_PROVIDER, GROQ_API_KEY, etc.
└── README.md
```

**The adapter is the spine.** One interface: `decode(message, context) → DecodeResult` and `reply(message, decode, tone) → stream`. Providers implement it. App code never imports a provider directly — only `lib/llm/index.ts` (env-selected). Swapping Groq↔Claude is a one-line env change, zero app edits. This is what makes "free for live, best for video" free.

---

## File creation order (test-first where load-bearing)

The load-bearing, silent-failure-prone units get tests FIRST (red→green). UI gets visual verification, not brittle markup tests.

1. **`lib/schema.ts`** + test — the contract everything depends on. Test: valid parses, invalid rejects.
2. **`lib/parse.ts`** + test — tolerant extraction. Tests: clean JSON, fenced JSON, JSON-with-prose, garbage→safe fallback. *(Most reliable to test, catches the #1 live-crash mode.)*
3. **`lib/llm/adapter.ts`** (interface) + **`groq.ts`** — wire to the free key; one real call asserts a schema-valid `DecodeResult`. Surfaces credential/reachability problems EARLY.
4. **`lib/prompts.ts`** — decode/reply/pre-send/safety templates. Iterate against the 6 demo samples.
5. **`lib/demo-data.ts`** — canned results for the 6 samples (demo-safe mode).
6. **`api/decode/route.ts`** (one-shot) → then **`api/reply/route.ts`** (streamed).
7. **Design system** (`components/`, tokens) → **`app/page.tsx`** core screen.
8. **Reply UI** → **Pre-send check** → **accessibility toggles** → **safety banner**.
9. **`app/landing/page.tsx`** (packaging).
10. **`extension/`** (MV3, generic selection).
11. Deploy config + README + doc pack.

**Ordering rationale:** schema/parse/adapter first because they're cheap to test and are exactly where a subtle bug silently breaks the live demo. Credentialed call at step 3 surfaces "the free key doesn't work" on Day 1, not Day 4.

---

## Phased execution (for the autonomous loop + goal)

Each phase = a goal with explicit **done-criteria** and an atomic commit. The loop does not advance until done-criteria pass. **Priority is top-to-bottom (R7).**

### Phase 0 — Scaffold & spine (MUST)  ·  Day 1 AM
- Next.js + TS + Tailwind scaffold; `.env.example`; git init.
- `schema.ts`, `parse.ts`, `adapter.ts`, `groq.ts` with tests green.
- **Done:** `npm test` green; one real Groq call returns a schema-valid DecodeResult printed to console.

### Phase 1 — Core decode end-to-end (MUST)  ·  Day 1 PM
- `prompts.ts`, `api/decode/route.ts`, minimal UI: paste → decode card renders (meaning, tone+confidence, upset?, what-they-want, urgency).
- `demo-data.ts` + demo-safe flag.
- **Done:** paste any of the 6 samples → correct, well-formatted decode card, live AND in demo-safe mode.

### Phase 2 — Reply drafts + polish core (MUST)  ·  Day 2 AM
- `api/reply/route.ts` (streamed), 3 tone tabs, copy buttons. Loading states, empty/error states, mobile-responsive, design-system pass.
- **Done:** decode → 3 distinct on-tone replies, copyable; screen looks finished at 320/768/1440.

### Phase 3 — Packaging v1 (MUST)  ·  Day 2 PM  ·  *parallelizable via /batch*
- Landing page (hero + the wow + privacy + a11y statement); 6 hero screenshots; README skeleton.
- Demo video SCRIPT (in Dariush's voice via `/fable`) + deck outline.
- **Done:** landing page deployable; script + deck outline written; a submittable artifact exists.

### Phase 4 — The "clever" + the "care" (SHOULD)  ·  Day 3 AM
- Pre-send check (your draft → how it lands + softer rewrite). Accessibility toggles (dyslexia font, plain-language, reduced motion, high contrast). Conservative safety net (R8).
- **Done:** pre-send works on 3 samples; toggles persist + visibly change UI; safety banner fires only on clear distress sample, not on normal-sad sample.

### Phase 5 — Extension (SHOULD)  ·  Day 3 PM  ·  *parallelizable via /batch*
- MV3 extension, generic `window.getSelection()` → floating Decode chip → popup with decode + reply, shared tokens. Backend CORS allowlist for the extension origin (test early).
- **Done:** select text on a test page → chip → correct decode inline.

### Phase 6 — Deploy + finish packaging (MUST-finish)  ·  Day 4
- Vercel deploy (or local-demo runbook if free-tier/CORS fights). Record 2–3 min demo video. Build deck (HTML/`/design-html` → `/make-pdf`, since Canva MCP is intermittent). PDF doc pack. Final `/design-review` + `/review` + security-review pass.
- **Done:** submitted: link/repo + video + deck + docs. Dry-run the demo twice. Buffer before 6/27.

---

## Expected failure points (pre-baked mitigations)

| Failure | Symptom | Mitigation (already designed in) |
|---|---|---|
| Free API key invalid/rate-limited mid-demo | 401/429, blank card | **Demo-safe mode** (R4) — toggle to canned; client debounce + server rate-limit |
| Model returns fenced/prose-wrapped JSON | parse throws, UI crash | **`parse.ts`** tolerant extraction + zod + safe fallback (R6) |
| Streaming JSON corrupts decode | half-rendered card | Decode is **one-shot, not streamed** (R3); stream only replies |
| Privacy claim challenged by judge | awkward Q&A | **Precise copy** (R2) + Groq posture; transparency line |
| Extension fails on Gmail shadow DOM | chip never appears | **Generic selection first** (R5); demo on a cooperative page; extension is SHOULD |
| CORS blocks extension→backend | works local, fails deployed | Explicit CORS allowlist; **test on Day 3, not Day 4** |
| Safety net false-positive on venting | feels patronizing | **Conservative, non-blocking** banner (R8); test both distress + normal-sad samples |
| Time overrun | extension half-done, no video | **R7 priority**: core + packaging are MUST and come first; extension/deploy are upside |
| Vercel deploy issues Day 4 | no live link | Local-demo runbook is an accepted fallback; video carries the demo |

---

## Runtime decisions deferred to execution
- Groq vs Gemini final pick — decide after a latency/quality smoke test on the 6 samples.
- Sponsor API credits — check the hackathon rules/Discord; if Anthropic credits exist, use Claude live.
- Extension demo target page — pick one that cooperates with content scripts.
- Whether to deploy or local-demo — decide Day 4 based on CORS/free-tier behavior.

## Deferred items (waiting on external input)
- Official logistics (exact deadline time, submission platform, judging weights) — `Source Material` TO-VERIFY list. Get from organizers; does not block the build.
- One free Groq API key from Dariush (or I scaffold with a placeholder and he pastes it at Phase 0 close).

## Commit message template
```
feat(read-the-room): <phase N> <what>

<why / decision notes>
Track 03 · Youth Code x AI
```

## Verification at each gate
- `npm test` green (schema/parse/adapter units).
- `npm run build` clean; no type errors.
- Visual check at 320/768/1440 for any UI phase.
- Decode works in BOTH live and demo-safe mode.
- code-reviewer + (for API/input-handling) security-reviewer agents on each slice.
- No message content in server logs (privacy claim must be literally true).

## Definition of done (submission)
- [ ] Decode + Reply flawless on 6 curated samples (live + demo-safe).
- [ ] Pre-send + accessibility + safety net working (SHOULD).
- [ ] Extension decodes selection on ≥1 page (SHOULD).
- [ ] Demo video (≤3 min) + deck + landing + README + PDF doc pack.
- [ ] Deployed link or local-demo runbook. Demo dry-run ×2. Submitted before 6/27.
