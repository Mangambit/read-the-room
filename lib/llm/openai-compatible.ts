/**
 * Shared chat helpers for any OpenAI-compatible endpoint (Groq, OpenRouter,
 * a local Ollama/llama.cpp server, etc.). Groq is the default live provider.
 */

export interface OAIConfig {
  baseUrl: string; // e.g. https://api.groq.com/openai/v1
  apiKey: string;
  model: string;
}

interface Msg {
  role: "system" | "user" | "assistant";
  content: string;
}

/** One-shot call that asks for a JSON object. Returns the raw content string. */
export async function oaiJson(
  cfg: OAIConfig,
  system: string,
  user: string,
): Promise<string> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ] satisfies Msg[],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${cfg.model} HTTP ${res.status}: ${body.slice(0, 500)}`);
  }
  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${cfg.model}: empty response`);
  return content;
}

/** Streamed completion. Yields text deltas as they arrive (SSE). */
export async function* oaiStream(
  cfg: OAIConfig,
  system: string,
  user: string,
): AsyncGenerator<string> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ] satisfies Msg[],
      temperature: 0.6,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(`${cfg.model} HTTP ${res.status}: ${body.slice(0, 500)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

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
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta: string | undefined = json?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // partial SSE frame; ignore and wait for more
      }
    }
  }
}
