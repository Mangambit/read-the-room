# Pitch deck — Read the Room

10 slides. Keep each to one idea + one image. Use the X-ray system: warm-neutral slides,
plum for the "reveal" slides, Schibsted Grotesk headers, Atkinson body. Screenshots live
in `packaging/screenshots/`.

---

**1 · Title**
> Read the Room
> *what they really mean*
Image: the landing hero (message → reveal). Your name · Youth Code x AI · Track 03.

**2 · The problem**
> Some messages cost you a whole evening of overthinking.
"ok." / "fine, do whatever." / a passive-aggressive email. For neurodivergent people and
anyone with social anxiety, reading tone isn't automatic — and getting it wrong has real
stakes (a grade, a friendship, a job).

**3 · The idea**
> What if you could see *through* a message to what they actually meant?
One sentence on the product. Image: the plum reveal.

**4 · Demo — the decode** *(plum slide)*
Screenshot: `app-decoded.png`. Callouts: real meaning · upset? · what they want · urgency
· confidence. "Plain language. No guessing."

**5 · Demo — reply + pre-send**
Two screenshots: the reply drafts, and `app-presend.png`. "It writes the reply — and
checks yours before you send it."

**6 · Built to be read** *(this is Track 03's heart)*
Screenshot: `app-accessibility.png`. Atkinson Hyperlegible everywhere · dyslexia / high
contrast / reduced motion in one tap · never color-alone · no judgment · a crisis safety
net. "Accessibility is the product, not a setting."

**7 · Private by design**
> Your messages are yours. We never store them.
Read once, then discarded. No account, no logs. (Judges *will* ask — own it.)

**8 · How it works** *(the engineering)*
> One adapter, three brains.
Provider-agnostic LLM layer: Groq (free, live) ↔ Claude (best) ↔ demo-safe (offline,
canned). Strict JSON + a crash-proof parser. "The demo physically can't fail."

**9 · Why it matters**
This is a tool a high-schooler can actually use tomorrow. It turns a moment of anxiety
into a moment of understanding — and it's built first for the people the rest of the
internet forgets.

**10 · What's next + try it**
Browser extension (decode any text, anywhere) · more languages · saved tones.
> Try it: [your link] · Built by Dariush.

---

## Build notes
- Generate as HTML via `/design-html` → export with `/make-pdf`, or build in slides.
- Lead with the demo (slides 3–5). Judges remember the product working, not the bullets.
- Slide 6 is your Track-03 win. Don't rush it.
