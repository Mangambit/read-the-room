import type { Metadata } from "next";
import Link from "next/link";
import { DecodeReveal } from "@/components/landing/DecodeReveal";
import { SAMPLES } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Read the Room — what they really mean",
  description:
    "Some messages cost you a whole evening of overthinking. Paste one and Read the Room tells you what they really mean, how they feel, and what to say back. Built for neurodivergent minds; useful for everyone.",
};

const HOW = ["crush-ok", "mom-fine", "teammate"]
  .map((id) => SAMPLES.find((s) => s.id === id))
  .filter((s): s is NonNullable<typeof s> => Boolean(s));

export default function Landing() {
  return (
    <div className="relative z-10">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-baseline gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-terracotta" />
          <span className="font-serif text-lg font-semibold text-ink">
            Read the Room
          </span>
        </div>
        <Link
          href="/"
          className="rounded-chip bg-ink px-4 py-2 text-sm font-bold text-paper transition hover:bg-terracotta"
        >
          Open the app
        </Link>
      </nav>

      {/* Hero */}
      <header className="mx-auto grid max-w-5xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-terracotta-ink">
            For everyone who overthinks the reply
          </p>
          <h1 className="mt-4 font-serif text-display leading-[0.98] text-ink">
            What did they{" "}
            <span className="italic text-terracotta">actually</span> mean?
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            A clipped &ldquo;ok.&rdquo; A &ldquo;fine, do whatever.&rdquo; Some
            messages cost you a whole evening of overthinking. Paste one and
            Read the Room tells you what&rsquo;s really going on — and what to
            say back.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-chip bg-ink px-6 py-3 font-bold text-paper shadow-soft transition hover:bg-terracotta"
            >
              Read a message →
            </Link>
            <span className="text-sm text-ink-faint">
              No sign-up. Nothing saved.
            </span>
          </div>
        </div>

        <DecodeReveal />
      </header>

      {/* How it works — real messages, real reads */}
      <section
        aria-labelledby="how"
        className="border-t border-line bg-paper-raised/40"
      >
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <h2
            id="how"
            className="font-serif text-h1 leading-tight text-ink"
          >
            Three words can ruin your night.
            <br />
            Here&rsquo;s the read.
          </h2>
          <p className="mt-3 max-w-prose text-ink-soft">
            Real messages, decoded. The same thing the app does the moment you
            paste.
          </p>

          <ul className="mt-10 flex flex-col gap-6">
            {HOW.map((s, i) => (
              <li
                key={s.id}
                className={`grid gap-3 rounded-card border border-line bg-paper p-6 shadow-soft sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-center sm:gap-8 ${
                  i % 2 === 1 ? "sm:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    They sent
                  </p>
                  <p className="mt-2 rounded-2xl rounded-bl-md border border-line bg-paper-sunk px-4 py-3 text-ink">
                    &ldquo;{s.message}&rdquo;
                  </p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta-ink">
                    What they really mean
                  </p>
                  <p className="mt-2 font-serif text-xl leading-snug text-ink">
                    {s.decode.meaning}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Built for how you read */}
      <section aria-labelledby="a11y" className="border-t border-line">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-terracotta-ink">
            Built for how you read
          </p>
          <h2
            id="a11y"
            className="mt-3 font-serif text-h1 leading-tight text-ink"
          >
            Made for neurodivergent minds first.
          </h2>
          <p className="mt-4 max-w-prose text-ink-soft">
            Reading tone isn&rsquo;t obvious for everyone, and that&rsquo;s
            normal. Read the Room is built to be calm and clear, not clinical.
          </p>
          <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {[
              [
                "A font designed to be read",
                "The whole interface is set in Atkinson Hyperlegible, drawn specifically so letters are hard to confuse.",
              ],
              [
                "Plain language, on demand",
                "One toggle rewrites every read in shorter, simpler words.",
              ],
              [
                "Calm by default",
                "Reduced-motion and high-contrast modes, soft surfaces, no flashing, no noise.",
              ],
              [
                "It never judges",
                "No streaks, no scores, no “you should have known.” Just the read and a way forward.",
              ],
            ].map(([t, d]) => (
              <div key={t}>
                <dt className="font-bold text-ink">{t}</dt>
                <dd className="mt-1 text-ink-soft">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Privacy promise */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-20">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-paper/60">
            The promise
          </p>
          <p className="mx-auto mt-4 max-w-xl font-serif text-h1 leading-tight">
            Your messages are yours. We never store them.
          </p>
          <p className="mx-auto mt-4 max-w-md text-paper/70">
            Each message is read once to help you, then discarded. No account,
            no history, nothing kept on a server.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-chip bg-paper px-6 py-3 font-bold text-ink transition hover:bg-terracotta hover:text-paper"
          >
            Try it now →
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 py-8 text-xs text-ink-faint">
        Read the Room · built for the Youth Code x AI hackathon · Track 03.
      </footer>
    </div>
  );
}
