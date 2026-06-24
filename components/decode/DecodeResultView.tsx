import type { DecodeResult, Upset, Urgency } from "@/lib/schema";

type Props = {
  result: DecodeResult;
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

function Eyebrow({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "plum";
}) {
  const color = tone === "plum" ? "text-on-plum-soft" : "text-ink-faint";
  return (
    <p
      className={`text-[0.7rem] font-bold uppercase tracking-[0.16em] ${color}`}
    >
      {children}
    </p>
  );
}

export function DecodeResultView({ result }: Props) {
  return (
    <article className="flex flex-col gap-3">
      {/* The reveal — the hidden meaning, seen through the surface */}
      <div className="reveal-scan animate-rise rounded-card bg-plum p-6 text-on-plum shadow-plum sm:p-8">
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

      {/* The read-outs — on the calm light surface */}
      <div className="animate-rise rounded-card border border-line bg-paper-raised p-6 shadow-soft sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Upset */}
          <div>
            <Eyebrow>Are they upset with you?</Eyebrow>
            <p className={`mt-2 text-lg font-bold ${upsetColor(result.upset)}`}>
              {UPSET_LABEL[result.upset]}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {result.upsetReason}
            </p>
          </div>

          {/* Confidence */}
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

          {/* Urgency */}
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

          {/* What they want */}
          <div className="rounded-2xl border-l-4 border-rose bg-rose-soft/60 px-4 py-3 sm:col-span-1">
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
