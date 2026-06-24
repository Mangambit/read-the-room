"use client";

import { useEffect, useState } from "react";

/**
 * Accessibility controls. Sets data-attributes on <html> that the CSS in
 * globals.css responds to (dyslexia font, high contrast, reduced motion).
 * Pure CSS effect — instant, no network, works in demo mode. Persists choices.
 */

type Settings = {
  dyslexia: boolean;
  contrast: boolean;
  motion: boolean; // true = reduced
};

const STORAGE_KEY = "rtr-a11y";

function apply(s: Settings) {
  const el = document.documentElement;
  el.dataset.dyslexia = s.dyslexia ? "true" : "";
  el.dataset.contrast = s.contrast ? "high" : "";
  el.dataset.motion = s.motion ? "reduced" : "";
  if (!s.dyslexia) delete el.dataset.dyslexia;
  if (!s.contrast) delete el.dataset.contrast;
  if (!s.motion) delete el.dataset.motion;
}

const TOGGLES: { key: keyof Settings; label: string; hint: string }[] = [
  { key: "dyslexia", label: "Dyslexia-friendly", hint: "Wider spacing, plain font" },
  { key: "contrast", label: "High contrast", hint: "Stronger text/background" },
  { key: "motion", label: "Reduce motion", hint: "Turn off animations" },
];

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    dyslexia: false,
    contrast: false,
    motion: false,
  });

  // Load saved settings on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = { ...settings, ...JSON.parse(raw) } as Settings;
        setSettings(saved);
        apply(saved);
      }
    } catch {
      // ignore corrupt storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(key: keyof Settings) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility settings"
          className="mb-3 w-64 rounded-card border border-line bg-paper-raised p-4 shadow-lift"
        >
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
            Make it easier to read
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {TOGGLES.map((t) => {
              const on = settings[t.key];
              return (
                <li key={t.key}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => toggle(t.key)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-3 py-2 text-left transition hover:border-rose"
                  >
                    <span>
                      <span className="block text-sm font-bold text-ink">
                        {t.label}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        {t.hint}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? "bg-rose" : "bg-paper-sunk"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper-raised shadow-soft transition-all ${on ? "left-[1.125rem]" : "left-0.5"}`}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Accessibility settings"
        className="flex items-center gap-2 rounded-chip border border-line bg-paper-raised px-4 py-2.5 text-sm font-bold text-ink shadow-lift transition hover:border-rose"
      >
        <span aria-hidden className="text-base">
          ☼
        </span>
        Accessibility
      </button>
    </div>
  );
}
