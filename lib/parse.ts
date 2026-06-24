import {
  DecodeResultSchema,
  PreSendResultSchema,
  type DecodeResult,
  type PreSendResult,
} from "./schema";

/**
 * Tolerant JSON extraction. Free models occasionally wrap JSON in ```fences```,
 * add a sentence before it, or trail commentary after. This pulls out the first
 * balanced JSON object and parses it. It NEVER fabricates data — on failure it
 * throws, and callers fall back to a friendly error (and demo-safe mode covers
 * the live demo). This is the #1 live-crash mitigation, so it is tested first.
 */
export function extractJsonObject(raw: string): unknown {
  let s = (raw ?? "").trim();

  // Prefer a fenced block if present: ```json ... ``` or ``` ... ```
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();

  const start = s.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON object found in model output");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === "\\") {
      escaped = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        const slice = s.slice(start, i + 1);
        return JSON.parse(slice);
      }
    }
  }

  throw new Error("Unbalanced JSON object in model output");
}

export function parseDecode(raw: string): DecodeResult {
  return DecodeResultSchema.parse(extractJsonObject(raw));
}

export function parsePreSend(raw: string): PreSendResult {
  return PreSendResultSchema.parse(extractJsonObject(raw));
}
