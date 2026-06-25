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
    model: model ?? process.env.CEREBRAS_MODEL ?? "llama-3.3-70b",
    visionModel:
      process.env.CEREBRAS_VISION_MODEL ?? "llama-4-scout-17b-16e-instruct",
  };
  return createOAIProvider(`cerebras:${cfg.model}`, cfg);
}
