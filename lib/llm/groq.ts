import type { LlmProvider } from "./types";
import { oaiJson, oaiStream, type OAIConfig } from "./openai-compatible";
import { parseDecode, parsePreSend } from "@/lib/parse";
import {
  DECODE_SYSTEM,
  decodeUser,
  replySystem,
  replyUser,
  PRESEND_SYSTEM,
  presendUser,
} from "@/lib/prompts";

/**
 * Groq — the default live-demo provider. Free, no credit card, very fast
 * inference (feels instant on stage). OpenAI-compatible API.
 */
export function createGroqProvider(): LlmProvider {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local, or set LLM_PROVIDER=demo for demo-safe mode.",
    );
  }
  const cfg: OAIConfig = {
    baseUrl: "https://api.groq.com/openai/v1",
    apiKey,
    // Fast, capable default; override with GROQ_MODEL.
    model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  };

  return {
    name: `groq:${cfg.model}`,
    isDemo: false,

    async decode(input) {
      const raw = await oaiJson(cfg, DECODE_SYSTEM, decodeUser(input));
      return parseDecode(raw);
    },

    reply(input) {
      return oaiStream(cfg, replySystem(input.tone), replyUser(input));
    },

    async presend(input) {
      const raw = await oaiJson(cfg, PRESEND_SYSTEM, presendUser(input));
      return parsePreSend(raw);
    },
  };
}
