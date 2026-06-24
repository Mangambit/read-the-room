/**
 * The signature element. The product's actual concept made visual: a received
 * message, then the terracotta "marker" decodes the subtext underneath it.
 * Pure CSS animation (no JS) so it works as a server component and respects
 * the global reduced-motion rule.
 */
export function DecodeReveal() {
  return (
    <figure className="relative mx-auto w-full max-w-md">
      {/* The received message — a chat bubble with one squared corner */}
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

      {/* Connector */}
      <div
        aria-hidden
        className="ml-8 h-6 w-px bg-line"
        style={{ animation: "rise 0.4s var(--ease-out-expo) 0.5s both" }}
      />

      {/* The decode */}
      <figcaption
        className="rounded-2xl border-l-4 border-terracotta bg-paper-raised px-5 py-4 shadow-soft"
        style={{ animation: "rise 0.55s var(--ease-out-expo) 0.6s both" }}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-terracotta-ink">
          What they really mean
        </p>
        <p className="mt-1.5 font-serif text-xl leading-snug text-ink">
          They&rsquo;re annoyed you&rsquo;re late and want it in now. The
          &ldquo;extra support&rdquo; is a polite jab, not a real offer.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink-soft">
          <span className="rounded-chip border border-line bg-paper px-2.5 py-0.5">
            passive-aggressive
          </span>
          <span className="rounded-chip border border-line bg-paper px-2.5 py-0.5">
            upset with you
          </span>
          <span className="rounded-chip border border-line bg-paper px-2.5 py-0.5">
            high urgency
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
