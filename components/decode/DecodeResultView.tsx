import type { DecodeResult, Tell, Upset, Urgency } from "@/lib/schema";

type Props = {
  result: DecodeResult;
  message: string;
};

const UPSET_LABEL: Record<Upset, string> = {
  yes: "Yes",
  probably: "Probably",
  no: "No",
};

function upsetColor(upset: Upset): string {
  if (upset === "yes") return "text-heat";
  if (upset === "probably") return "text-caution";
  return "text-calm";
}

function confidenceColor(confidence: number): string {
  if (confidence >= 70) return "bg-calm";
  if (confidence >= 45) return "bg-caution";
  return "bg-ink-faint";
}

const URGENCY_FILLED: Record<Urgency, number> = { low: 1, medium: 2, high: 3 };

/** Render the message with each tell's exact phrase highlighted. */
function highlightTells(message: string, tells: Tell[]): React.ReactNode[] {
  const ranges = tells
    .map((t) => {
      const start = message.indexOf(t.quote);
      return start < 0 ? null : { start, end: start + t.quote.length, tell: t };
    })
    .filter((r): r is { start: number; end: number; tell: Tell } => r !== null)
    .sort((a, b) => a.start - b.start);

  // drop overlaps
  const clean: typeof ranges = [];
  let lastEnd = -1;
  for (const r of ranges) {
    if (r.start >= lastEnd) {
      clean.push(r);
      lastEnd = r.end;
    }
  }

  if (clean.length === 0) return [message];

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  clean.forEach((r, i) => {
    if (r.start > cursor) nodes.push(message.slice(cursor, r.start));
    nodes.push(
      <mark
        key={i}
        title={r.tell.reads}
        className="rounded bg-rose-soft px-0.5 text-ink decoration-rose-ink/40 underline decoration-dotted underline-offset-2"
      >
        {message.slice(r.start, r.end)}
      </mark>,
    );
    cursor = r.end;
  });
  if (cursor < message.length) nodes.push(message.slice(cursor));
  return nodes;
}

function Eyebrow({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "plum";
}) {
  const color = tone === "plum" ? "text-on-plum-soft" : "text-ink-faint";
  return (
    <p className={`text-[0.7rem] font-bold uppercase tracking-[0.16em] ${color}`}>
      {children}
    </p>
  );
}

export function DecodeResultView({ result, message }: Props) {
  const hasTells = result.tells.length > 0;

  return (
    <article className="flex flex-col gap-3">
      {/* Their message, with the tells highlighted */}
      <div className="animate-rise rounded-card border border-line bg-paper-raised p-5 shadow-soft sm:p-6" style={{ animationDelay: "0ms" }}>
        <Eyebrow>Their message</Eyebrow>
        <p className="mt-2 text-[1.05rem] leading-relaxed text-ink">
          {highlightTells(message, result.tells)}
        </p>
      </div>

      {/* The reveal — the hidden meaning, seen through the surface */}
      <div className="reveal-scan animate-rise rounded-card bg-plum p-6 text-on-plum shadow-plum sm:p-8" style={{ animationDelay: "90ms" }}>
        <Eyebrow tone="plum">What they really mean</Eyebrow>
        <p className="mt-3 font-display text-meaning leading-snug text-on-plum">
          {result.meaning}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {result.tones.map((tone) => (
            <li
              key={tone}
              className="rounded-chip border border-on-plum/20 bg-plum-raised px-3 py-1 text-sm text-on-plum-soft"
            >
              {tone}
            </li>
          ))}
        </ul>
      </div>

      {/* Read-outs */}
      <div className="animate-rise rounded-card border border-line bg-paper-raised p-6 shadow-soft sm:p-8" style={{ animationDelay: "180ms" }}>
        {hasTells && (
          <div className="mb-6 border-b border-line pb-6">
            <Eyebrow>What gave it away</Eyebrow>
            <ul className="mt-3 flex flex-col gap-2.5">
              {result.tells.map((t, i) => (
                <li key={i} className="text-[0.95rem] leading-relaxed">
                  <span className="font-bold text-rose-ink">
                    &ldquo;{t.quote}&rdquo;
                  </span>{" "}
                  <span className="text-ink-soft">— {t.reads}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Eyebrow>Are they upset with you?</Eyebrow>
            <p className={`mt-2 text-lg font-bold ${upsetColor(result.upset)}`}>
              {UPSET_LABEL[result.upset]}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {result.upsetReason}
            </p>
          </div>

          <div>
            <Eyebrow>How sure this read is</Eyebrow>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-sunk">
                <div
                  className={`h-full rounded-full ${confidenceColor(result.confidence)} transition-[width] duration-700`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-bold tabular-nums text-ink-soft">
                {result.confidence}%
              </span>
            </div>
          </div>

          <div>
            <Eyebrow>Urgency</Eyebrow>
            <div className="mt-3 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-full ${
                    i < URGENCY_FILLED[result.urgency]
                      ? "bg-rose"
                      : "bg-paper-sunk"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm capitalize text-ink-soft">
                {result.urgency}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border-l-4 border-rose bg-rose-soft/60 px-4 py-3">
            <Eyebrow>What they want from you</Eyebrow>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">
              {result.wants}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
