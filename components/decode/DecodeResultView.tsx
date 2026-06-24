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
  if (upset === "yes") return "text-flag";
  if (upset === "probably") return "text-amber";
  return "text-sage";
}

function confidenceColor(confidence: number): string {
  if (confidence >= 70) return "bg-sage";
  if (confidence >= 45) return "bg-amber";
  return "bg-ink-faint";
}

const URGENCY_FILLED: Record<Urgency, number> = { low: 1, medium: 2, high: 3 };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
      {children}
    </p>
  );
}

export function DecodeResultView({ result }: Props) {
  return (
    <article className="animate-rise rounded-card border border-line bg-paper-raised p-6 shadow-soft sm:p-8">
      {/* The meaning — the hero of the result */}
      <Eyebrow>What they really mean</Eyebrow>
      <p className="mt-3 font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]">
        {result.meaning}
      </p>

      <hr className="my-6 border-line" />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Tone */}
        <div>
          <Eyebrow>Tone</Eyebrow>
          <ul className="mt-2 flex flex-wrap gap-2">
            {result.tones.map((tone) => (
              <li
                key={tone}
                className="rounded-chip border border-line bg-paper px-3 py-1 text-sm text-ink-soft"
              >
                {tone}
              </li>
            ))}
          </ul>
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
                    ? "bg-terracotta"
                    : "bg-paper-sunk"
                }`}
              />
            ))}
            <span className="ml-1 text-sm capitalize text-ink-soft">
              {result.urgency}
            </span>
          </div>
        </div>
      </div>

      {/* What they want — highlighted callout */}
      <div className="mt-6 rounded-2xl border-l-4 border-terracotta bg-terracotta-soft/60 px-5 py-4">
        <Eyebrow>What they want from you</Eyebrow>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">
          {result.wants}
        </p>
      </div>
    </article>
  );
}
