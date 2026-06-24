"use client";

import { useEffect, useRef, useState } from "react";
import {
  REPLY_TONES,
  type DecodeResult,
  type ReplyGoal,
  type ReplyTone,
  type Sender,
} from "@/lib/schema";

type Props = {
  message: string;
  decode: DecodeResult;
  sender?: Sender;
};

const TONE_LABEL: Record<ReplyTone, string> = {
  warm: "Warm",
  professional: "Professional",
  firm: "Firm",
};

const GOALS: { value: ReplyGoal; label: string }[] = [
  { value: "auto", label: "Whatever fits" },
  { value: "apologize", label: "Smooth it over" },
  { value: "boundary", label: "Set a boundary" },
  { value: "deescalate", label: "Calm it down" },
  { value: "clarify", label: "Ask what they mean" },
];

type ReplyState = Record<ReplyTone, string>;
const EMPTY: ReplyState = { warm: "", professional: "", firm: "" };

export function ReplyDrafts({ message, decode, sender }: Props) {
  const [tone, setTone] = useState<ReplyTone>("warm");
  const [goal, setGoal] = useState<ReplyGoal>("auto");
  const [replies, setReplies] = useState<ReplyState>(EMPTY);
  const [streamingTone, setStreamingTone] = useState<ReplyTone | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inFlight = useRef<Set<ReplyTone>>(new Set());
  // Bumped whenever the goal changes, to invalidate any in-flight stream so a
  // stale (old-goal) reply can't stamp ghost text into the reset state.
  const genId = useRef(0);

  async function generate(which: ReplyTone, withGoal: ReplyGoal, force = false) {
    // `force` bypasses the cache check — needed after a goal change resets
    // `replies` to EMPTY but the closure here still sees the old (truthy) value.
    if ((!force && replies[which]) || inFlight.current.has(which)) return;
    inFlight.current.add(which);
    const myId = ++genId.current;
    setStreamingTone(which);
    setError(null);
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          decode,
          tone: which,
          goal: withGoal,
          sender,
        }),
      });
      if (!res.ok || !res.body) throw new Error("reply failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (genId.current !== myId) {
          await reader.cancel().catch(() => {});
          break;
        }
        acc += decoder.decode(value, { stream: true });
        setReplies((prev) => ({ ...prev, [which]: acc }));
      }
    } catch {
      setError("Couldn't draft that one. Try another tone.");
    } finally {
      inFlight.current.delete(which);
      setStreamingTone((t) => (t === which ? null : t));
    }
  }

  // Auto-generate the warm reply once on mount.
  useEffect(() => {
    generate("warm", "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectTone(next: ReplyTone) {
    setTone(next);
    setCopied(false);
    generate(next, goal);
  }

  function selectGoal(next: ReplyGoal) {
    if (next === goal) return;
    genId.current++; // invalidate any in-flight stream from the old goal
    setGoal(next);
    setCopied(false);
    setReplies(EMPTY);
    inFlight.current.clear();
    setStreamingTone(null);
    // regenerate the current tone with the new goal (force past the now-stale cache)
    generate(tone, next, true);
  }

  async function copy() {
    const text = replies[tone];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy — select the text and copy manually.");
    }
  }

  const current = replies[tone];
  const isStreaming = streamingTone === tone;

  return (
    <section className="animate-rise rounded-card border border-line bg-paper-raised p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
          Your reply
        </p>
        <div
          role="group"
          aria-label="Reply tone"
          className="inline-flex rounded-chip border border-line bg-paper p-1"
        >
          {REPLY_TONES.map((t) => {
            const active = tone === t;
            return (
              <button
                key={t}
                aria-pressed={active}
                type="button"
                onClick={() => selectTone(t)}
                className={`rounded-chip px-3 py-1 text-sm transition ${
                  active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                }`}
              >
                {TONE_LABEL[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal selector */}
      <div className="mt-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
          What do you want to do?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const active = goal === g.value;
            return (
              <button
                key={g.value}
                type="button"
                aria-pressed={active}
                onClick={() => selectGoal(g.value)}
                className={`rounded-chip border px-3 py-1 text-sm transition ${
                  active
                    ? "border-rose bg-rose-ink text-on-rose"
                    : "border-line bg-paper text-ink-soft hover:border-rose"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 min-h-24 rounded-2xl border border-line bg-paper p-4 text-[0.95rem] leading-relaxed text-ink">
        {current ? (
          <p className="whitespace-pre-wrap">
            {current}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-rose align-middle" />
            )}
          </p>
        ) : (
          <p className="text-ink-faint">
            {isStreaming ? "Drafting…" : "Pick a tone to draft a reply."}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={copy}
          disabled={!current || isStreaming}
          className="rounded-chip border border-line bg-paper px-4 py-1.5 text-sm font-bold text-ink transition hover:border-rose disabled:opacity-40"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
        {error && <span className="text-sm text-heat">{error}</span>}
      </div>
    </section>
  );
}
