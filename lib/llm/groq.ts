import type { LlmProvider } from "./types";
import type { OAIConfig } from "./openai-compatible";
import { createOAIProvider } from "./oai-provider";

/**
 * Groq — free, no credit card, very fast (feels instant on stage).
 * Accepts an explicit key so multiple keys can be chained for more headroom.
 */
export function createGroqProvider(apiKey?: string, model?: string): LlmProvider {
  const key = apiKey ?? process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local, or set LLM_PROVIDER=demo for demo-safe mode.",
    );
  }
  const cfg: OAIConfig = {
    baseUrl: "https://api.groq.com/openai/v1",
    apiKey: key,
    model: model ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    visionModel:
      process.env.GROQ_VISION_MODEL ??
      "meta-llama/llama-4-scout-17b-16e-instruct",
  };
  return createOAIProvider(`groq:${cfg.model}`, cfg);
}
