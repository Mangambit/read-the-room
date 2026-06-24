export const meta = {
  name: 'foolproof-read-the-room',
  description: 'Role-specialized adversarial audit + 3-juror verification of Read the Room before deploy',
  phases: [
    { title: 'Role audits', detail: '6 specialists scrutinize their domain in parallel' },
    { title: 'Design audit', detail: 'browse-based design/product judge (runs alone to avoid browser contention)' },
    { title: 'Judge panel', detail: '3 adversarial jurors verify each finding' },
    { title: 'Synthesize', detail: 'dedup, prioritize, deploy verdict' },
  ],
}

const ROOT = '/Users/dariush/Desktop/College Counselor Vault/Competitions/Youth Code x AI/read-the-room'

const CTX = `Project root: "${ROOT}"
It's a Next.js 16 + React 19 + Tailwind v4 hackathon app (Track 03, accessibility-first) that decodes the hidden tone/subtext of a message via an LLM. Live at http://localhost:3000 (real Groq). Key files: app/api/{decode,reply,presend}/route.ts; lib/llm/* (adapter groq/anthropic/demo, openai-compatible.ts, parse.ts tolerant JSON parser, schema.ts zod, prompts.ts, demo-data.ts); components/* (ReadTheRoom, decode/DecodeResultView, decode/ReplyDrafts, decode/SafetyBanner, presend/PreSendView, a11y/AccessibilityMenu, landing/DecodeReveal); extension/ (MV3 content.js). 20 unit tests, build green, about to deploy.
Your job: find REAL issues that would LOSE the hackathon or BREAK a live demo. No style nitpicks, no invented problems. READ THE ACTUAL CODE. If you curl localhost:3000, SPACE requests ~1s apart (sequential) to avoid Groq burst rate-limits. If you genuinely find nothing in your area, return an empty findings array.`

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          dimension: { type: 'string' },
          title: { type: 'string' },
          evidence: { type: 'string' },
          file: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'dimension', 'title', 'evidence', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    real: { type: 'boolean' },
    agreedSeverity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NOT_AN_ISSUE'] },
    reason: { type: 'string' },
  },
  required: ['real', 'agreedSeverity', 'reason'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string' },
    readyToDeploy: { type: 'boolean' },
    mustFix: {
      type: 'array',
      items: {
        type: 'object',
        properties: { severity: { type: 'string' }, title: { type: 'string' }, file: { type: 'string' }, fix: { type: 'string' } },
        required: ['severity', 'title', 'fix'],
      },
    },
    shouldFix: {
      type: 'array',
      items: { type: 'object', properties: { title: { type: 'string' }, fix: { type: 'string' } }, required: ['title', 'fix'] },
    },
    notes: { type: 'string' },
  },
  required: ['verdict', 'readyToDeploy', 'mustFix', 'shouldFix'],
}

const ROLES = [
  { key: 'security', prompt: `ROLE: Security reviewer.\n${CTX}\nCheck: secrets (run \`git grep -n gsk_jk9 $(git rev-list --all)\` in the repo — must be empty; confirm no NEXT_PUBLIC_ key; .env.local git-ignored); the permissive CORS (Access-Control-Allow-Origin:*) on /api/decode and abuse/rate-limit risk; input validation on all 3 routes; whether ANY user message/draft content is logged (privacy is a core claim — grep console.* in app/api); XSS in extension/content.js (every model value through esc() before innerHTML); prompt-injection impact; any path/SSRF issues. Real vulnerabilities only.` },
  { key: 'reliability', prompt: `ROLE: Reliability & live-demo resilience engineer.\n${CTX}\nA prior test saw ~8 of 19 decode requests return a NULL result under 4-wide PARALLEL curl load (no error status, just a missing body), all succeeding on sequential retry. INVESTIGATE the root cause: read app/api/decode/route.ts, lib/llm/groq.ts, lib/llm/openai-compatible.ts — is it Groq rate-limiting (429), a timeout, an unhandled provider error returning an empty/!ok body, or a route bug? Reproduce with a small controlled curl burst (then wait). Also: what happens if Groq is slow or down (is there a request timeout? a hang?); malformed model JSON path; whether demo-safe mode is a reliable fallback for the public link. The #1 risk is the LIVE DEMO breaking or hanging. Propose concrete hardening.` },
  { key: 'ai-safety', prompt: `ROLE: AI safety auditor.\n${CTX}\nStress crisisFlag with ~12 diverse distress phrasings via SEQUENTIAL curl (~1s apart): explicit, passive ("just want it to stop"), indirect, non-English, plus normal-sad/venting false alarms. Does it flag real distress AND avoid over-flagging normal venting? Also: can a pasted message jailbreak the model into harmful output that then renders? Is the 988 resource US-only (note as a limitation)? For a clearly ABUSIVE-relationship message, does the reply coach safely or badly? Real safety gaps only — read lib/prompts.ts and components/decode/SafetyBanner.tsx.` },
  { key: 'read-quality', prompt: `ROLE: AI read-quality QA.\n${CTX}\nRun ~12 fresh diverse tricky messages through /api/decode SEQUENTIALLY and judge each: specificity, honest confidence calibration, tells that are EXACT substrings, no hedge filler (a bit/possibly/slightly/kind of), no over-reading neutral/warm/short messages. Also test /api/presend on 2 drafts and /api/reply with 2 goals. Flag any read that is generic, hedgy, mis-calibrated, over-reads, or has a non-substring tell (verify substrings yourself). Read lib/prompts.ts so fixes are concrete.` },
  { key: 'accessibility', prompt: `ROLE: Accessibility auditor (WCAG 2.2 AA; this is an accessibility-first Track-03 product, bar is high).\n${CTX}\nA fix round just changed: --color-ink-faint #635e68, --color-caution #855d12, high-contrast overrides, AccessibilityMenu rebuilt as a non-modal disclosure (focus-on-open, Escape, outside-click, focus-return), role=tab -> aria-pressed on mode+tone toggles, confidence role=meter with text equivalent, aria-live status + role=status loader, interactive tells (hover phrase <-> list). VERIFY these are correctly implemented in the code AND find anything STILL failing: any remaining contrast pair, keyboard operability, screen-reader semantics of the new 3-up diagnostics and the interactive tells (are the marks reachable/announced?), SafetyBanner semantics, focus management gaps. Read app/globals.css and the component files. Real WCAG issues only.` },
  { key: 'code-correctness', prompt: `ROLE: Code-correctness & edge-case reviewer.\n${CTX}\nRun \`npm test\` and \`npx tsc --noEmit\` (must be green). Deep pass for real bugs/edge cases: lib/parse.ts (fences/prose/escapes/unbalanced); the React state machine in components/decode/ReplyDrafts.tsx (genId stale-stream guard, tone+goal caching correctness, the mount effect); components/decode/DecodeResultView.tsx highlightTells (overlapping ranges, a quote that appears TWICE in the message, adjacency, empty tells); the streaming reader loops + releaseLock; ReadTheRoom mode switching reset; the demo provider async generator; schema tells .default([]) interaction with strict providers. Find genuine bugs, not style.` },
]

phase('Role audits')
const auditResults = await parallel(
  ROLES.map((r) => () => agent(r.prompt, { label: 'audit:' + r.key, phase: 'Role audits', schema: FINDINGS_SCHEMA })),
)

phase('Design audit')
const designPrompt = `ROLE: Design & product judge (browse-based).\n${CTX}\nUse the gstack browse binary: $HOME/.claude/skills/gstack/browse/dist/browse (call it $B). Screenshot (save under /private/tmp only): the app decode result (fill #rtr-input, click "Read the room", wait ~4s), the reply card with goal chips, the pre-send flow, and the landing — at 1440 and 390 — plus high-contrast and dyslexia modes (open the "Accessibility" button bottom-right). READ each PNG. Judge HARSHLY against a presentation/design-AWARD bar: what still separates this from award-winning? Any visual regression, overlap, mobile issue, broken/empty state, or console error ($B console --errors)? Cite the screen + the component file. Real, specific, actionable findings only.`
const design = await agent(designPrompt, { label: 'audit:design', phase: 'Design audit', schema: FINDINGS_SCHEMA })

const all = [...auditResults, design]
  .filter(Boolean)
  .flatMap((r) => (r.findings || []))
  .map((f, i) => ({ ...f, id: i }))
log(`Collected ${all.length} raw findings from 7 reviewers`)

const toJudge = all.filter((f) => f.severity !== 'LOW')
const lows = all.filter((f) => f.severity === 'LOW')

phase('Judge panel')
const judged = await parallel(
  toJudge.map((f) => () =>
    parallel(
      [0, 1, 2].map((j) => () =>
        agent(
          `You are an ADVERSARIAL juror (#${j + 1} of 3) verifying ONE audit finding about the Read the Room app at "${ROOT}" (live at http://localhost:3000). Be SKEPTICAL — auditors report false positives (e.g. a "parser bug" that unit tests prove is actually correct). VERIFY IT YOURSELF: read the cited file and/or curl the endpoint (space curls ~1s). Decide independently whether this is a REAL issue that would lose the hackathon, break the demo, violate WCAG, or be a genuine bug — and whether the severity is right. Do NOT rubber-stamp.\n\nFINDING:\nseverity: ${f.severity}\ndimension: ${f.dimension}\ntitle: ${f.title}\nevidence: ${f.evidence}\nfile: ${f.file || 'n/a'}\nproposed fix: ${f.fix}\n\nIf it is not actually a problem, return real=false and agreedSeverity=NOT_AN_ISSUE with your reason.`,
          { label: 'judge:' + f.id + ':' + j, phase: 'Judge panel', schema: VERDICT_SCHEMA },
        ),
      ),
    ).then((votes) => ({ finding: f, votes: votes.filter(Boolean) })),
  ),
)

const confirmed = judged
  .filter(Boolean)
  .filter((x) => x.votes.filter((v) => v.real).length >= 2)
  .map((x) => {
    const reals = x.votes.filter((v) => v.real)
    const sev = reals.map((v) => v.agreedSeverity).sort()[Math.floor(reals.length / 2)] || x.finding.severity
    return { ...x.finding, agreedSeverity: sev, jurorReasons: x.votes.map((v) => v.reason) }
  })
log(`${confirmed.length}/${toJudge.length} MEDIUM+ findings CONFIRMED real by >=2 jurors`)

phase('Synthesize')
const synth = await agent(
  `Synthesize a final pre-deploy report for the Read the Room hackathon app from these JUROR-CONFIRMED findings (each already verified real by >=2 of 3 adversarial jurors) plus the unjudged LOW findings. Dedupe overlapping items. Sort by real severity. Put CONFIRMED CRITICAL/HIGH into mustFix and CONFIRMED MEDIUM into shouldFix; mention notable LOWs in notes. Give a blunt overall verdict: is the app foolproof and at a winning bar, and is it ready to deploy? Set readyToDeploy true ONLY if there are no confirmed CRITICAL/HIGH issues.\n\nCONFIRMED (medium+):\n${JSON.stringify(confirmed, null, 1)}\n\nLOW (unjudged):\n${JSON.stringify(lows, null, 1)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA },
)

return { rawCount: all.length, confirmedCount: confirmed.length, lowCount: lows.length, report: synth }
