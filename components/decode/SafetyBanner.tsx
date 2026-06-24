/**
 * Crisis safety net. Shown (non-blocking) above a result when the decode flags
 * clear distress. Calm and non-clinical — it never replaces the read, it just
 * offers a gentle door to real support. Conservative by design (see prompts.ts).
 * A white card (not a tint) so the resource links keep AA contrast, and a
 * labelled region so it's reachable by landmark navigation.
 */
export function SafetyBanner() {
  return (
    <div
      role="region"
      aria-label="Support resources"
      className="animate-rise rounded-card border border-line border-l-4 border-l-calm bg-paper-raised px-5 py-4 shadow-soft"
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
        (Suicide &amp; Crisis Lifeline); for abuse or an unsafe relationship, the
        Domestic Violence Hotline is{" "}
        <a
          href="tel:18007997233"
          className="font-bold text-calm underline underline-offset-2"
        >
          1-800-799-7233
        </a>
        . Outside the US, find a local line at{" "}
        <a
          href="https://findahelpline.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-calm underline underline-offset-2"
        >
          findahelpline.com
        </a>
        . You deserve support.
      </p>
    </div>
  );
}
