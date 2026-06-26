import type { LlmProvider } from "./types";
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
 * Anthropic (Claude) — optional best-quality provider, used for the recorded
 * demo video. Requires ANTHROPIC_API_KEY with a little credit. Swapped in via
 * LLM_PROVIDER=anthropic; zero app-code changes thanks to the adapter.
 */
const API = "https://api.anthropic.com/v1/messages";
const VERSION = "2023-06-01";

function model(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
}

async function claudeJson(system: string, user: string): Promise<string> {
  const apiKey = requireKey();
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": VERSION,
    },
    body: JSON.stringify({
      model: model(),
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`anthropic HTTP ${res.status}: ${body.slice(0, 500)}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.content?.[0]?.text;
  if (!text) throw new Error("anthropic: empty response");
  return text;
}

function requireKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Use LLM_PROVIDER=groq or =demo instead.",
    );
  }
  return apiKey;
}

async function* claudeStream(
  system: string,
  user: string,
): AsyncGenerator<string> {
  const apiKey = requireKey();
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": VERSION,
    },
    body: JSON.stringify({
      model: model(),
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
      stream: true,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(`anthropic HTTP ${res.status}: ${body.slice(0, 500)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        try {
          const json = JSON.parse(payload);
          if (json?.type === "content_block_delta" && json?.delta?.text) {
            yield json.delta.text as string;
          }
        } catch {
          // partial frame
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function createAnthropicProvider(): LlmProvider {
  requireKey();
  return {
    name: `anthropic:${model()}`,
    isDemo: false,
    async decode(input) {
      return parseDecode(await claudeJson(DECODE_SYSTEM, decodeUser(input)));
    },
    reply(input) {
      return claudeStream(replySystem(input.tone), replyUser(input));
    },
    async presend(input) {
      return parsePreSend(await claudeJson(PRESEND_SYSTEM, presendUser(input)));
    },
  };
}
