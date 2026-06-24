/**
 * Crisis safety net. Shown (non-blocking) above a result when the decode flags
 * clear distress. Calm and non-clinical — it never replaces the read, it just
 * offers a gentle door to real support. Conservative by design (see prompts.ts).
 */
export function SafetyBanner() {
  return (
    <div
      role="note"
      className="animate-rise rounded-card border border-calm/40 bg-calm/10 px-5 py-4"
    >
      <p className="font-bold text-ink">
        This message sounds heavy. You don&rsquo;t have to carry it alone.
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        If you or someone you&rsquo;re talking to is going through something, you
        can reach a real person any time. In the US, call or text{" "}
        <a
          href="tel:988"
          className="font-bold text-calm underline underline-offset-2"
        >
          988
        </a>{" "}
        (Suicide &amp; Crisis Lifeline), or chat at{" "}
        <a
          href="https://988lifeline.org"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-calm underline underline-offset-2"
        >
          988lifeline.org
        </a>
        . You deserve support.
      </p>
    </div>
  );
}
