# Deploying Read the Room

> ✅ **Deployed (production, demo-safe mode): https://read-the-room-phi.vercel.app**
> Public, no login wall, verified live. Runs `LLM_PROVIDER=demo` so the link can't be
> rate-limited or expose a key. To redeploy after changes: `npx vercel --prod --yes
> --scope dariushafshar209-2622s-projects`.

Two ways to have it ready for judges. You can do both.

## Recommended split
- **Public link → demo-safe mode.** Deploy with `LLM_PROVIDER=demo`. The shared link can't
  be rate-limited, can't expose your API key, and *always works* (it serves the 6 curated
  reads). Perfect for a link judges click on their own.
- **Recorded video / live booth → Groq.** Run locally (or a second deploy) with
  `LLM_PROVIDER=groq` so it reads *any* message live. Your `.env.local` already has this.

---

## Option A — Vercel (shareable link)

Read the Room is a standard Next.js app, so Vercel is the path of least resistance.

### 1. Put the repo on GitHub
```bash
# from read-the-room/
gh repo create read-the-room --private --source=. --push
# (or: create an empty repo on github.com and `git remote add origin … && git push -u origin main`)
```
> `.env.local` is git-ignored, so your Groq key is NOT pushed. Good.

### 2. Import to Vercel
- Go to vercel.com → **Add New… → Project** → import the `read-the-room` repo.
- Framework preset: **Next.js** (auto-detected). Build command and output: defaults.

### 3. Set environment variables (Project → Settings → Environment Variables)
**For the safe public link:**
```
LLM_PROVIDER = demo
```
**Or, for a live public link (uses your free Groq quota — fine for a demo):**
```
LLM_PROVIDER = groq
GROQ_API_KEY = <your gsk_… key>
GROQ_MODEL   = llama-3.3-70b-versatile
```

### 4. Deploy
Click **Deploy**. You'll get a `https://read-the-room-….vercel.app` URL.

### 5. Point the extension at it (optional)
Edit `extension/content.js`, set `API_BASE` to your Vercel URL, reload the unpacked
extension. Now it works on any page, anywhere — not just on your machine.

### CLI alternative
```bash
npm i -g vercel
vercel            # first deploy (preview) — follow prompts
vercel env add LLM_PROVIDER     # enter: demo   (or groq + GROQ_API_KEY)
vercel --prod     # promote to the public URL
```

---

## Option B — Local demo for judging (no deploy)
```bash
npm run dev        # http://localhost:3000
```
Use `LLM_PROVIDER=groq` (live, in `.env.local`) for real reads, or `=demo` so it can't
fail. This is a perfectly good way to demo — and it's what the recorded video uses.

---

## Pre-submit checklist
- [ ] `npm run build` is green.
- [ ] Public link set to `LLM_PROVIDER=demo` (or you accept live Groq quota usage).
- [ ] Extension `API_BASE` updated if you want it to work off your machine.
- [ ] Demo video recorded (see `packaging/DEMO_SCRIPT.md`).
- [ ] Repo link + live link + video + deck (`packaging/Read-the-Room-Deck.pdf`) in the submission.
