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

/** The reader's age band — shapes how we read slang/tone AND how we write the reply. */
export const AGES = ["middle", "high", "college", "adult"] as const;
export type Age = (typeof AGES)[number];

export const AGE_LABEL: Record<Age, string> = {
  middle: "Middle school",
  high: "High school",
  college: "College",
  adult: "Adult",
};

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

/** A specific phrase in the message and what it signals. The quote must be an
 *  exact substring of the original so the UI can highlight it. */
export const TellSchema = z.object({
  quote: z.string().min(1).max(160),
  reads: z.string().min(1).max(240),
});
export type Tell = z.infer<typeof TellSchema>;

/** Result of decoding a received message. One-shot structured output. */
export const DecodeResultSchema = z.object({
  /** Plain-English: what they actually mean. 1-2 sentences. */
  meaning: z.string().min(1).max(600),
  /** 1-4 short tone adjectives, lowercase. */
  tones: z.array(z.string().min(1).max(30)).min(1).max(4),
  /** The exact words that gave it away (0-3), for highlighting. */
  tells: z.array(TellSchema).max(3).default([]),
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

/** What the reader is trying to achieve with their reply. */
export const REPLY_GOALS = [
  "auto",
  "apologize",
  "boundary",
  "deescalate",
  "clarify",
] as const;
export type ReplyGoal = (typeof REPLY_GOALS)[number];

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
  /** The message text. May be empty when an image is provided. */
  message: string;
  /** Optional screenshot of a conversation, as a data URL, for extra context. */
  image?: string;
  sender?: Sender;
  age?: Age;
}

export interface ReplyInput {
  message: string;
  decode: DecodeResult;
  tone: ReplyTone;
  goal?: ReplyGoal;
  sender?: Sender;
  age?: Age;
}

export interface PreSendInput {
  /** The reader's own draft they are about to send. */
  draft: string;
  /** Optional original message they are replying to, for context. */
  original?: string;
  sender?: Sender;
  age?: Age;
}
