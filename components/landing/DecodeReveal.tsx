/**
 * The signature element. The product's concept made visual: a normal message,
 * then an x-ray that reveals the subtext underneath it. Pure CSS animation (no
 * JS) so it works as a server component and respects the global reduced-motion
 * rule.
 */
export function DecodeReveal() {
  return (
    <figure className="relative mx-auto w-full max-w-md">
      {/* The surface — what they said, a normal chat bubble */}
      <div className="animate-rise rounded-2xl rounded-bl-md border border-line bg-paper-raised p-5 shadow-soft">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
          Your professor · just now
        </p>
        <p className="mt-2 text-[1.05rem] leading-relaxed text-ink">
          Per my last email, the assignment was due Friday.{" "}
          <span className="mark-decode font-semibold">
            Let me know if you need extra support
          </span>{" "}
          managing deadlines going forward.
        </p>
      </div>

      {/* Scan-line connector */}
      <div
        aria-hidden
        className="my-1 ml-8 flex items-center gap-2"
        style={{ animation: "rise 0.4s var(--ease-out-expo) 0.5s both" }}
      >
        <span className="h-5 w-px border-l border-dashed border-rose" />
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-rose-ink">
          reading through ↓
        </span>
      </div>

      {/* The reveal — what they really mean, seen underneath */}
      <figcaption
        className="reveal-scan rounded-2xl bg-plum px-5 py-5 text-on-plum shadow-plum"
        style={{ animation: "rise 0.55s var(--ease-out-expo) 0.6s both" }}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-on-plum-soft">
          What they really mean
        </p>
        <p className="mt-1.5 font-display text-xl leading-snug text-on-plum">
          They&rsquo;re annoyed you&rsquo;re late and want it in now. The{" "}
          <span className="text-rose-light">&ldquo;extra support&rdquo;</span> is
          a polite jab, not a real offer.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-on-plum-soft">
          {["passive-aggressive", "upset with you", "high urgency"].map((t) => (
            <span
              key={t}
              className="rounded-chip border border-on-plum/20 bg-plum-raised px-2.5 py-0.5"
            >
              {t}
            </span>
          ))}
        </div>
      </figcaption>
    </figure>
  );
}
