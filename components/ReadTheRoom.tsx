"use client";

import { useState } from "react";
import type { DecodeResult, PreSendResult, Sender } from "@/lib/schema";
import { SAMPLES } from "@/lib/demo-data";
import { DecodeResultView } from "@/components/decode/DecodeResultView";
import { ReplyDrafts } from "@/components/decode/ReplyDrafts";
import { SafetyBanner } from "@/components/decode/SafetyBanner";
import { PreSendView } from "@/components/presend/PreSendView";

type Mode = "decode" | "presend";
type Status = "idle" | "loading" | "done" | "error";

const SENDER_CHIPS: { value: Sender; label: string }[] = [
  { value: "teacher", label: "Teacher" },
  { value: "boss", label: "Boss" },
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family" },
  { value: "crush", label: "Crush" },
  { value: "coworker", label: "Coworker" },
];

interface DecodeOk {
  result: DecodeResult;
  demo: boolean;
}
interface PreSendOk {
  result: PreSendResult;
  demo: boolean;
}

const COPY: Record<
  Mode,
  { label: string; placeholder: string; sender: string; cta: string; hint?: string }
> = {
  decode: {
    label: "Paste the message that’s stressing you out",
    placeholder: "e.g. “Per my last email, the assignment was due Friday…”",
    sender: "Who’s it from?",
    cta: "Read the room",
    hint: "One message or a whole back-and-forth — paste it all.",
  },
  presend: {
    label: "Paste the reply you’re about to send",
    placeholder: "e.g. “k. whatever works.”",
    sender: "Who are you replying to?",
    cta: "Check how it lands",
  },
};

export function ReadTheRoom() {
  const [mode, setMode] = useState<Mode>("decode");
  const [text, setText] = useState("");
  const [sender, setSender] = useState<Sender | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const [result, setResult] = useState<DecodeResult | null>(null);
  const [decoded, setDecoded] = useState<{ message: string; sender?: Sender } | null>(null);
  const [presend, setPresend] = useState<PreSendResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStatus("idle");
    setResult(null);
    setPresend(null);
    setDecoded(null);
    setError(null);
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setText("");
    setSender(null);
    reset();
  }

  async function runDecode(msg: string, snd: Sender | null) {
    setStatus("loading");
    setError(null);
    setResult(null);
    setPresend(null);
    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sender: snd ?? undefined }),
      });
      const data = (await res.json()) as DecodeOk | { error: string };
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong.");
        setStatus("error");
        return;
      }
      setResult(data.result);
      setDecoded({ message: msg, sender: snd ?? undefined });
      setIsDemo(data.demo);
      setStatus("done");
    } catch {
      setError("I couldn’t reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  async function runPresend(draft: string, snd: Sender | null) {
    setStatus("loading");
    setError(null);
    setResult(null);
    setPresend(null);
    try {
      const res = await fetch("/api/presend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, sender: snd ?? undefined }),
      });
      const data = (await res.json()) as PreSendOk | { error: string };
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong.");
        setStatus("error");
        return;
      }
      setPresend(data.result);
      setIsDemo(data.demo);
      setStatus("done");
    } catch {
      setError("I couldn’t reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length === 0) return;
    if (mode === "decode") runDecode(text, sender);
    else runPresend(text, sender);
  }

  function loadSample(id: string) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setText(sample.message);
    setSender(sample.sender);
    runDecode(sample.message, sample.sender);
  }

  const canSubmit = text.trim().length > 0 && status !== "loading";
  const copy = COPY[mode];

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div
        role="group"
        aria-label="What do you want to do?"
        className="inline-flex self-start rounded-chip border border-line bg-paper-raised p-1"
      >
        {(["decode", "presend"] as Mode[]).map((m) => (
          <button
            key={m}
            aria-pressed={mode === m}
            type="button"
            onClick={() => switchMode(m)}
            className={`rounded-chip px-4 py-1.5 text-sm font-bold transition ${
              mode === m ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
            }`}
          >
            {m === "decode" ? "Decode a message" : "Check my reply"}
          </button>
        ))}
      </div>

      {/* Screen-reader status for async results */}
      <p aria-live="polite" className="sr-only">
        {status === "loading"
          ? "Reading your message, please wait."
          : status === "done"
            ? mode === "decode"
              ? "The decode is ready below."
              : "The reply check is ready below."
            : ""}
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-line bg-paper-raised p-5 shadow-soft sm:p-6"
      >
        <label
          htmlFor="rtr-input"
          className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint"
        >
          {copy.label}
        </label>
        <textarea
          id="rtr-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder={copy.placeholder}
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none transition placeholder:text-ink-faint focus:border-rose focus:ring-4 focus:ring-rose-soft"
        />
        {copy.hint && (
          <p className="mt-2 text-xs text-ink-faint">{copy.hint}</p>
        )}

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <fieldset>
            <legend className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
              {copy.sender}{" "}
              <span className="font-normal normal-case tracking-normal text-ink-faint">
                (optional)
              </span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SENDER_CHIPS.map((s) => {
                const active = sender === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSender(active ? null : s.value)}
                    className={`rounded-chip border px-3 py-1 text-sm transition ${
                      active
                        ? "border-rose bg-rose text-on-rose"
                        : "border-line bg-paper text-ink-soft hover:border-rose"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={!canSubmit}
            className="shrink-0 rounded-chip bg-ink px-6 py-3 font-bold text-paper shadow-soft transition hover:-translate-y-0.5 hover:bg-rose hover:shadow-lift active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {status === "loading"
              ? mode === "decode"
                ? "Reading…"
                : "Checking…"
              : copy.cta}
          </button>
        </div>
      </form>

      {/* Example chips (decode mode only) */}
      {mode === "decode" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-faint">Or try an example:</span>
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadSample(s.id)}
              disabled={status === "loading"}
              className="rounded-chip border border-line bg-paper px-3 py-1 text-sm text-ink-soft transition hover:-translate-y-px hover:border-rose hover:text-ink disabled:opacity-40"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Result area */}
      {status === "loading" && <DecodeSkeleton />}

      {status === "error" && error && (
        <p
          role="alert"
          className="rounded-card border border-line bg-paper-raised px-5 py-4 text-ink-soft"
        >
          {error}
        </p>
      )}

      {status === "done" && (
        <div className="flex flex-col gap-3">
          {isDemo && (
            <p className="text-xs text-ink-faint">
              Showing a saved example (demo-safe mode) — no network needed.
            </p>
          )}

          {mode === "decode" && result && (
            <>
              {result.crisisFlag && <SafetyBanner />}
              <DecodeResultView result={result} message={decoded?.message ?? ""} />
              {decoded && (
                <ReplyDrafts
                  key={decoded.message}
                  message={decoded.message}
                  decode={result}
                  sender={decoded.sender}
                />
              )}
            </>
          )}

          {mode === "presend" && presend && <PreSendView result={presend} />}
        </div>
      )}
    </div>
  );
}

function DecodeSkeleton() {
  return (
    <div
      role="status"
      aria-label="Reading your message, please wait"
      className="flex flex-col gap-3"
    >
      <div className="rounded-card border border-line bg-paper-raised p-5 shadow-soft sm:p-6">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton mt-3 h-4 w-full rounded" />
        <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      </div>
      <div className="reveal-scan rounded-card bg-plum p-6 shadow-plum sm:p-8">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-on-plum-soft">
          Reading between the lines…
        </p>
        <div className="mt-3 h-5 w-full animate-pulse rounded bg-plum-raised" />
        <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-plum-raised" />
      </div>
    </div>
  );
}
