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
 * Build an LlmProvider for any OpenAI-compatible endpoint (Groq, Cerebras,
 * OpenRouter, a local server). Groq and Cerebras both wrap this.
 */
export function createOAIProvider(name: string, cfg: OAIConfig): LlmProvider {
  return {
    name,
    isDemo: false,
    async decode(input) {
      return parseDecode(await oaiJson(cfg, DECODE_SYSTEM, decodeUser(input)));
    },
    reply(input) {
      return oaiStream(cfg, replySystem(input.tone), replyUser(input));
    },
    async presend(input) {
      return parsePreSend(await oaiJson(cfg, PRESEND_SYSTEM, presendUser(input)));
    },
  };
}
