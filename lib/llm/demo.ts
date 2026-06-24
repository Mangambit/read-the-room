import type { LlmProvider } from "./types";
import {
  findSample,
  GENERIC_DEMO_DECODE,
  GENERIC_DEMO_REPLIES,
  DEMO_PRESEND,
} from "@/lib/demo-data";

/**
 * Demo-safe provider — zero network. Returns hand-written canned analyses for
 * the 6 curated samples (and a believable generic for anything else). This is
 * the live-demo insurance policy: if wifi/API dies on stage, the demo still
 * runs perfectly. Enabled with LLM_PROVIDER=demo.
 */
function chunk(text: string): string[] {
  // Split into word-ish chunks so the UI streams naturally.
  return text.match(/\S+\s*/g) ?? [text];
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function createDemoProvider(): LlmProvider {
  return {
    name: "demo:canned",
    isDemo: true,

    async decode(input) {
      await sleep(450); // a beat, so the loader is visible
      return findSample(input.message)?.decode ?? GENERIC_DEMO_DECODE;
    },

    async *reply(input) {
      const text =
        findSample(input.message)?.replies[input.tone] ??
        GENERIC_DEMO_REPLIES[input.tone];
      for (const c of chunk(text)) {
        await sleep(18);
        yield c;
      }
    },

    async presend() {
      await sleep(450);
      return DEMO_PRESEND;
    },
  };
}
