import { z } from "zod";

/**
 * The contract everything depends on. If this is subtly wrong, every
 * downstream render and provider is unreliable — so it is tested first.
 */

export const SENDERS = [
  "teacher",
  "boss",
  "friend",
  "family",
  "crush",
  "coworker",
  "other",
] as const;
export type Sender = (typeof SENDERS)[number];

export const TONES_HINT = [
  "frustrated",
  "rushed",
  "anxious",
  "warm",
  "disappointed",
  "passive-aggressive",
  "sincere",
  "playful",
  "distant",
  "hurt",
  "neutral",
  "excited",
] as const;

export const Upset = z.enum(["yes", "probably", "no"]);
export type Upset = z.infer<typeof Upset>;

export const Urgency = z.enum(["low", "medium", "high"]);
export type Urgency = z.infer<typeof Urgency>;

/** Result of decoding a received message. One-shot structured output. */
export const DecodeResultSchema = z.object({
  /** Plain-English: what they actually mean. 1-2 sentences. */
  meaning: z.string().min(1).max(600),
  /** 1-4 short tone adjectives, lowercase. */
  tones: z.array(z.string().min(1).max(30)).min(1).max(4),
  /** How confident the read is, 0-100. */
  confidence: z.number().int().min(0).max(100),
  /** Is the sender upset *with the reader*? */
  upset: Upset,
  /** One line on why (or why not). */
  upsetReason: z.string().min(1).max(300),
  /** The hidden ask: what they want the reader to do or understand. */
  wants: z.string().min(1).max(400),
  /** How time-sensitive the reader's response is. */
  urgency: Urgency,
  /**
   * Conservative crisis flag. TRUE only when the message contains CLEAR
   * indications of self-harm, suicidal ideation, or abuse. Errs toward false.
   */
  crisisFlag: z.boolean(),
});
export type DecodeResult = z.infer<typeof DecodeResultSchema>;

export const REPLY_TONES = ["warm", "professional", "firm"] as const;
export type ReplyTone = (typeof REPLY_TONES)[number];

/** Result of the pre-send check: how the reader's own draft will land. */
export const PreSendResultSchema = z.object({
  /** How the recipient is likely to read this draft. */
  landing: z.string().min(1).max(600),
  /** Concrete ways it could be misread. */
  risks: z.array(z.string().min(1).max(240)).max(4),
  /** A warmer/clearer rewrite, ready to send. */
  softer: z.string().min(1).max(1200),
});
export type PreSendResult = z.infer<typeof PreSendResultSchema>;

export interface DecodeInput {
  message: string;
  sender?: Sender;
}

export interface ReplyInput {
  message: string;
  decode: DecodeResult;
  tone: ReplyTone;
  sender?: Sender;
}

export interface PreSendInput {
  /** The reader's own draft they are about to send. */
  draft: string;
  /** Optional original message they are replying to, for context. */
  original?: string;
  sender?: Sender;
}
