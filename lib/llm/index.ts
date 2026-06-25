import type { LlmProvider } from "./types";
import { createGroqProvider } from "./groq";
import { createCerebrasProvider } from "./cerebras";
import { createAnthropicProvider } from "./anthropic";
import { createDemoProvider } from "./demo";
import { createChainProvider } from "./chain";

export type { LlmProvider } from "./types";

function groqKeys(): string[] {
  return (process.env.GROQ_API_KEY ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Resolves the active provider from env, building a fallback CHAIN so a capped
 * or down key transparently rolls to the next:
 *   LLM_PROVIDER=demo            -> offline canned (demo-safe mode)
 *   GROQ_API_KEY=key1,key2,...   -> each key tried in turn (more daily headroom)
 *   CEREBRAS_API_KEY=...         -> Cerebras fallback after Groq
 *   ANTHROPIC_API_KEY=...        -> Claude (first if LLM_PROVIDER=anthropic, else last)
 * The route-level catch is the final safety net to demo-safe mode.
 */
export function getProvider(): LlmProvider {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase();
  if (explicit === "demo") return createDemoProvider();

  const providers: LlmProvider[] = [];
  const safePush = (make: () => LlmProvider) => {
    try {
      providers.push(make());
    } catch {
      // key missing/invalid — skip this provider
    }
  };

  if (explicit === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    safePush(() => createAnthropicProvider());
  }
  // Default order: Cerebras first (faster, more headroom), Groq as fallback.
  // Set LLM_PROVIDER=groq to put Groq first.
  const pushGroq = () => groqKeys().forEach((k) => safePush(() => createGroqProvider(k)));
  const pushCerebras = () => {
    if (process.env.CEREBRAS_API_KEY) safePush(() => createCerebrasProvider());
  };
  if (explicit === "groq") {
    pushGroq();
    pushCerebras();
  } else {
    pushCerebras();
    pushGroq();
  }
  if (explicit !== "anthropic" && process.env.ANTHROPIC_API_KEY) {
    safePush(() => createAnthropicProvider());
  }

  if (providers.length === 0) return createDemoProvider();
  return createChainProvider(providers);
}
