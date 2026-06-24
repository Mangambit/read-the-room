import type {
  DecodeInput,
  ReplyInput,
  PreSendInput,
  DecodeResult,
  PreSendResult,
} from "@/lib/schema";

/**
 * The spine. App code imports ONLY this interface (via lib/llm/index.ts),
 * never a concrete provider. Swapping Groq <-> Anthropic <-> demo is an env
 * change, not a code change.
 */
export interface LlmProvider {
  /** Human-readable provider id, surfaced in /api/health and logs (no secrets). */
  readonly name: string;
  /** True for the offline canned provider (demo-safe mode). */
  readonly isDemo: boolean;

  /** One-shot structured decode of a received message. */
  decode(input: DecodeInput): Promise<DecodeResult>;

  /** Streamed reply draft in the requested tone (plain text chunks). */
  reply(input: ReplyInput): AsyncIterable<string>;

  /** One-shot structured pre-send check of the reader's own draft. */
  presend(input: PreSendInput): Promise<PreSendResult>;
}
