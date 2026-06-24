"use client";

import { useState } from "react";
import type { DecodeResult, Sender } from "@/lib/schema";
import { SAMPLES } from "@/lib/demo-data";
import { DecodeResultView } from "@/components/decode/DecodeResultView";
import { ReplyDrafts } from "@/components/decode/ReplyDrafts";

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
  provider: string;
  demo: boolean;
}

export function ReadTheRoom() {
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState<Sender | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [decoded, setDecoded] = useState<{ message: string; sender?: Sender } | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runDecode(msg: string, snd: Sender | null) {
    setStatus("loading");
    setError(null);
    setResult(null);
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
      setError("I couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length === 0) return;
    runDecode(message, sender);
  }

  function loadSample(id: string) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setMessage(sample.message);
    setSender(sample.sender);
    runDecode(sample.message, sample.sender);
  }

  const canSubmit = message.trim().length > 0 && status !== "loading";

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-line bg-paper-raised p-5 shadow-soft sm:p-6"
      >
        <label
          htmlFor="message"
          className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint"
        >
          Paste the message that&rsquo;s stressing you out
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="e.g. “Per my last email, the assignment was due Friday…”"
          className="mt-2 w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none transition placeholder:text-ink-faint focus:border-rose focus:ring-4 focus:ring-rose-soft"
        />

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <fieldset>
            <legend className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Who&rsquo;s it from? <span className="font-normal normal-case tracking-normal text-ink-faint">(optional)</span>
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
                        ? "border-rose bg-rose text-paper"
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
            className="shrink-0 rounded-chip bg-ink px-6 py-3 font-bold text-paper shadow-soft transition hover:bg-rose disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "Reading…" : "Read the room"}
          </button>
        </div>
      </form>

      {/* Example chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-faint">Or try an example:</span>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => loadSample(s.id)}
            disabled={status === "loading"}
            className="rounded-chip border border-line bg-paper px-3 py-1 text-sm text-ink-soft transition hover:border-rose hover:text-ink disabled:opacity-40"
          >
            {s.label}
          </button>
        ))}
      </div>

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

      {status === "done" && result && (
        <div className="flex flex-col gap-3">
          {isDemo && (
            <p className="text-xs text-ink-faint">
              Showing a saved example (demo-safe mode) — no network needed.
            </p>
          )}
          <DecodeResultView result={result} />
          {decoded && (
            <ReplyDrafts
              key={decoded.message}
              message={decoded.message}
              decode={result}
              sender={decoded.sender}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DecodeSkeleton() {
  return (
    <div className="rounded-card border border-line bg-paper-raised p-6 shadow-soft sm:p-8">
      <div className="skeleton h-3 w-32 rounded" />
      <div className="skeleton mt-4 h-7 w-full rounded" />
      <div className="skeleton mt-2 h-7 w-3/4 rounded" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton mt-3 h-5 w-40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
