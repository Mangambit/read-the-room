"use client";

import { useState } from "react";
import type { PreSendResult } from "@/lib/schema";

type Props = {
  result: PreSendResult;
};

export function PreSendView({ result }: Props) {
  const [copied, setCopied] = useState(false);

  async function copySofter() {
    try {
      await navigator.clipboard.writeText(result.softer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore; user can select manually
    }
  }

  return (
    <article className="flex flex-col gap-3">
      {/* How it lands — the reveal */}
      <div className="reveal-scan animate-rise rounded-card bg-plum p-6 text-on-plum shadow-plum sm:p-8">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-on-plum-soft">
          How this will land
        </p>
        <p className="mt-3 font-display text-meaning leading-snug text-on-plum">
          {result.landing}
        </p>
      </div>

      <div className="animate-rise rounded-card border border-line bg-paper-raised p-6 shadow-soft sm:p-8">
        {result.risks.length > 0 && (
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
              It could be misread as
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {result.risks.map((risk, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-[0.95rem] leading-relaxed text-ink-soft"
                >
                  <span aria-hidden className="text-caution">
                    •
                  </span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Softer rewrite */}
        <div
          className={`rounded-2xl border-l-4 border-rose bg-rose-soft/60 px-4 py-3 ${result.risks.length > 0 ? "mt-5" : ""}`}
        >
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-rose-ink">
            A warmer way to say it
          </p>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">
            {result.softer}
          </p>
          <button
            type="button"
            onClick={copySofter}
            className="mt-3 rounded-chip border border-line bg-paper-raised px-4 py-1.5 text-sm font-bold text-ink transition hover:border-rose"
          >
            {copied ? "Copied ✓" : "Copy this"}
          </button>
        </div>
      </div>
    </article>
  );
}
