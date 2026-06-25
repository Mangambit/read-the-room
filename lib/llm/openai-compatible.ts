/**
 * Shared chat helpers for any OpenAI-compatible endpoint (Groq, OpenRouter,
 * a local Ollama/llama.cpp server, etc.). Groq is the default live provider.
 */

export interface OAIConfig {
  baseUrl: string; // e.g. https://api.groq.com/openai/v1
  apiKey: string;
  model: string;
  visionModel?: string; // used when an image is supplied
}

/**
 * One-shot call that asks for a JSON object. Returns the raw content string.
 * If `image` (a data URL) is given, routes to the vision model and sends the
 * image as a content part.
 */
export async function oaiJson(
  cfg: OAIConfig,
  system: string,
  user: string,
  image?: string,
): Promise<string> {
  const useVision = Boolean(image);
  const model = useVision ? (cfg.visionModel ?? cfg.model) : cfg.model;
  const userContent = useVision
    ? [
        { type: "text", text: user },
        { type: "image_url", image_url: { url: image } },
      ]
    : user;

  const payload: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    temperature: 0.4,
    max_tokens: 800,
  };
  // Vision models often reject response_format; rely on the prompt + tolerant parser.
  if (!useVision) payload.response_format = { type: "json_object" };

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(useVision ? 30000 : 15000),
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
      ],
      temperature: 0.6,
      max_tokens: 600,
      stream: true,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(`${cfg.model} HTTP ${res.status}: ${body.slice(0, 500)}`);
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
  } finally {
    reader.releaseLock();
  }
}
