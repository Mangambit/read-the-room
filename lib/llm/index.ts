import type { LlmProvider } from "./types";
import { createGroqProvider } from "./groq";
import { createAnthropicProvider } from "./anthropic";
import { createDemoProvider } from "./demo";

export type { LlmProvider } from "./types";

export type ProviderName = "groq" | "anthropic" | "demo";

/**
 * Single place app code resolves the active provider. Selected by env var:
 *   LLM_PROVIDER=groq      -> free, fast live demo (default when GROQ_API_KEY set)
 *   LLM_PROVIDER=anthropic -> best quality, for the recorded video
 *   LLM_PROVIDER=demo      -> offline canned (demo-safe mode)
 *
 * Default: groq if a key exists, otherwise demo (so the app always runs).
 */
export function resolveProviderName(): ProviderName {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase();
  if (explicit === "groq" || explicit === "anthropic" || explicit === "demo") {
    return explicit;
  }
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "demo";
}

let cached: { name: ProviderName; provider: LlmProvider } | null = null;

export function getProvider(): LlmProvider {
  const name = resolveProviderName();
  if (cached && cached.name === name) return cached.provider;

  const provider =
    name === "groq"
      ? createGroqProvider()
      : name === "anthropic"
        ? createAnthropicProvider()
        : createDemoProvider();

  cached = { name, provider };
  return provider;
}
