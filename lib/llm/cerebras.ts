import type { LlmProvider } from "./types";
import type { OAIConfig } from "./openai-compatible";
import { createOAIProvider } from "./oai-provider";

/**
 * Cerebras — another free, fast, OpenAI-compatible inference provider with a
 * generous free tier. Used as a fallback when Groq is capped, or on its own.
 */
export function createCerebrasProvider(
  apiKey?: string,
  model?: string,
): LlmProvider {
  const key = apiKey ?? process.env.CEREBRAS_API_KEY;
  if (!key) {
    throw new Error("CEREBRAS_API_KEY is not set.");
  }
  const cfg: OAIConfig = {
    baseUrl: "https://api.cerebras.ai/v1",
    apiKey: key,
    // gpt-oss-120b: strong reasoning model, clean JSON + clean streamed content
    // (reasoning lands in a separate field). Override with CEREBRAS_MODEL.
    model: model ?? process.env.CEREBRAS_MODEL ?? "gpt-oss-120b",
    // This account has no vision model; vision falls through to a vision-capable
    // provider in the chain (e.g. Groq llama-4-scout) when configured.
    visionModel: process.env.CEREBRAS_VISION_MODEL,
  };
  return createOAIProvider(`cerebras:${cfg.model}`, cfg);
}
