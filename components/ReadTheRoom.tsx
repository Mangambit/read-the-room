"use client";

import { useEffect, useRef, useState } from "react";
import type { Age, DecodeResult, PreSendResult, Sender } from "@/lib/schema";
import { AGES, AGE_LABEL } from "@/lib/schema";
import { SAMPLES } from "@/lib/demo-data";

/** Downscale a picked image to a small JPEG data URL (keeps the request tiny). */
function downscaleImage(file: File, maxW = 1100, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas context"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
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
    hint: "One message, a whole back-and-forth, or a screenshot — whatever you've got.",
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
  const [decoded, setDecoded] = useState<{
    message: string;
    sender?: Sender;
    age?: Age;
    image?: string;
  } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setImage(await downscaleImage(file));
    } catch {
      setError("Couldn't read that image — try another one.");
    }
  }
  const [presend, setPresend] = useState<PreSendResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [age, setAge] = useState<Age | null>(null);

  // Age is a persistent preference — it shapes both the read and the reply voice.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rtr-age");
      if (saved && (AGES as readonly string[]).includes(saved)) {
        setAge(saved as Age);
      }
    } catch {
      // ignore
    }
  }, []);

  function selectAge(next: Age) {
    const value = age === next ? null : next;
    setAge(value);
    try {
      if (value) localStorage.setItem("rtr-age", value);
      else localStorage.removeItem("rtr-age");
    } catch {
      // ignore
    }
  }

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
    setImage(null);
    reset();
  }

  async function runDecode(msg: string, snd: Sender | null, img: string | null) {
    setStatus("loading");
    setError(null);
    setResult(null);
    setPresend(null);
    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          image: img ?? undefined,
          sender: snd ?? undefined,
          age: age ?? undefined,
        }),
      });
      const data = (await res.json()) as DecodeOk | { error: string };
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong.");
        setStatus("error");
        return;
      }
      setResult(data.result);
      setDecoded({
        message: msg,
        sender: snd ?? undefined,
        age: age ?? undefined,
        image: img ?? undefined,
      });
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
        body: JSON.stringify({
          draft,
          sender: snd ?? undefined,
          age: age ?? undefined,
        }),
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
    const hasImage = mode === "decode" && Boolean(image);
    if (text.trim().length === 0 && !hasImage) return;
    if (mode === "decode") runDecode(text, sender, image);
    else runPresend(text, sender);
  }

  function loadSample(id: string) {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setText(sample.message);
    setSender(sample.sender);
    setImage(null);
    runDecode(sample.message, sample.sender, null);
  }

  const canSubmit =
    (text.trim().length > 0 || (mode === "decode" && Boolean(image))) &&
    status !== "loading";
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

      {/* Age — tailors the read's slang + the reply voice */}
      <fieldset>
        <legend className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
          I&rsquo;m in{" "}
          <span className="font-normal normal-case tracking-normal text-ink-faint">
            (tunes the slang + your reply voice — optional)
          </span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {AGES.map((a) => {
            const active = age === a;
            return (
              <button
                key={a}
                type="button"
                aria-pressed={active}
                onClick={() => selectAge(a)}
                className={`rounded-chip border px-3 py-1 text-sm transition ${
                  active
                    ? "border-rose-ink bg-rose-ink text-on-rose"
                    : "border-line bg-paper-raised text-ink-soft hover:border-rose"
                }`}
              >
                {AGE_LABEL[a]}
              </button>
            );
          })}
        </div>
      </fieldset>

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

        {mode === "decode" && (
          <div className="mt-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickImage}
              className="hidden"
            />
            {image ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Screenshot to decode"
                  className="h-16 w-auto rounded-lg border border-line"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="rounded-chip border border-line bg-paper px-3 py-1 text-sm text-ink-soft transition hover:border-rose"
                >
                  Remove screenshot
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-chip border border-line bg-paper px-3 py-1.5 text-sm text-ink-soft transition hover:-translate-y-px hover:border-rose hover:text-ink"
              >
                📷 Add a screenshot
              </button>
            )}
          </div>
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
                        ? "border-rose bg-rose-ink text-on-rose"
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
            className="shrink-0 rounded-chip bg-ink px-6 py-3 font-bold text-paper shadow-soft transition hover:-translate-y-0.5 hover:bg-rose-ink hover:shadow-lift active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
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
              <DecodeResultView
                result={result}
                message={decoded?.message ?? ""}
                image={decoded?.image}
              />
              {decoded && !result.crisisFlag && (
                <ReplyDrafts
                  key={decoded.message}
                  message={decoded.message}
                  decode={result}
                  sender={decoded.sender}
                  age={decoded.age}
                />
              )}
              {result.crisisFlag && (
                <p className="rounded-card border border-line bg-paper-raised px-5 py-4 text-sm leading-relaxed text-ink-soft">
                  We&rsquo;re not drafting a reply here. When someone&rsquo;s
                  really hurting, being present matters more than the perfect
                  words — let them know you&rsquo;re there, and share a resource
                  if it feels right.
                </p>
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
