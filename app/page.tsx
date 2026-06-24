import { ReadTheRoom } from "@/components/ReadTheRoom";

export default function Home() {
  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 py-10 sm:py-16">
      <header className="mb-8">
        <div className="flex items-baseline gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full bg-rose"
          />
          <h1 className="font-display text-lg font-semibold tracking-tight text-ink">
            Read the Room
          </h1>
        </div>
        <p className="mt-3 font-display text-h1 leading-tight text-ink">
          Understand what they{" "}
          <span className="italic text-rose">really</span> mean.
        </p>
        <p className="mt-2 max-w-prose text-ink-soft">
          Paste a message that&rsquo;s hard to read. Get the tone, the hidden
          ask, and a reply — in plain language. Built for neurodivergent minds;
          useful for everyone.
        </p>
      </header>

      <main className="flex-1">
        <ReadTheRoom />
      </main>

      <footer className="mt-12 border-t border-line pt-5 text-xs text-ink-faint">
        <p>
          We never store your messages. They&rsquo;re read once to help you, then
          discarded.
        </p>
      </footer>
    </div>
  );
}
