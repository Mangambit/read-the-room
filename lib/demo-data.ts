import type {
  DecodeResult,
  PreSendResult,
  ReplyTone,
  Sender,
} from "./schema";

/**
 * Curated demo samples. These power BOTH the "try an example" chips and
 * demo-safe mode (offline canned responses). Hand-written so the live demo and
 * the recorded video never depend on a network call.
 */
export interface DemoSample {
  id: string;
  label: string; // short chip label
  sender: Sender;
  message: string;
  decode: DecodeResult;
  replies: Record<ReplyTone, string>;
}

export const SAMPLES: DemoSample[] = [
  {
    id: "professor",
    label: "Passive-aggressive professor",
    sender: "teacher",
    message:
      "Per my last email, the assignment was due Friday. Let me know if you need extra support managing deadlines going forward.",
    decode: {
      meaning:
        "They're annoyed you missed the deadline and are reminding you they already told you once. The 'extra support' offer is a polite jab, not a genuine offer of help.",
      tones: ["passive-aggressive", "frustrated"],
      tells: [
        {
          quote: "Per my last email",
          reads:
            "Opening with 'per my last email' is a pointed reminder that they already told you once — a flag of irritation.",
        },
        {
          quote: "extra support managing deadlines",
          reads:
            "The 'extra support' line is a polite jab at your reliability, not a genuine offer of help.",
        },
      ],
      confidence: 88,
      upset: "yes",
      upsetReason:
        "'Per my last email' plus the pointed 'extra support' line both signal irritation aimed at you.",
      wants:
        "A short, sincere acknowledgement and the assignment submitted now — no long excuses.",
      urgency: "high",
      crisisFlag: false,
    },
    replies: {
      warm: "Hi Professor — you're right, and I'm sorry I missed Friday. That's on me. I'm submitting it today and I've set reminders so it won't happen again. Thank you for the nudge.",
      professional:
        "Hi Professor, thank you for the reminder, and I apologize for missing the Friday deadline. I'm submitting the assignment today and will make sure I stay ahead of future due dates.",
      firm: "Thanks for following up. I missed the deadline and I'm submitting today. I've got my due dates tracked now, so we should be good going forward.",
    },
  },
  {
    id: "boss-call",
    label: "Vague 'hop on a call?'",
    sender: "boss",
    message: "Can you hop on a call when you get a sec?",
    decode: {
      meaning:
        "They want to talk fairly soon. The casual wording doesn't tell you whether it's good or bad news — but 'when you get a sec' usually means now-ish, not whenever.",
      tones: ["neutral", "direct"],
      tells: [
        {
          quote: "when you get a sec",
          reads:
            "Sounds casual, but paired with a call request it usually means soon, not whenever.",
        },
      ],
      confidence: 55,
      upset: "no",
      upsetReason:
        "Nothing in the wording signals anger — it reads as routine, just ambiguous about the topic.",
      wants:
        "You to make yourself available for a quick call in the next little while.",
      urgency: "medium",
      crisisFlag: false,
    },
    replies: {
      warm: "Sure thing! I'm free right now — want to call me, or should I send a link? 😊",
      professional:
        "Of course — I'm available now. Shall I call you, or would you like to send a meeting link?",
      firm: "Sure. I'm free for the next 30 minutes — send a link whenever works and I'll jump on.",
    },
  },
  {
    id: "crush-ok",
    label: '"ok." from a crush',
    sender: "crush",
    message: "ok.",
    decode: {
      meaning:
        "A one-word 'ok.' with a period can read as flat or a little distant — but there's very little to go on here. This could just as easily mean they're busy. Don't over-read a single word.",
      tones: ["distant", "ambiguous"],
      tells: [
        {
          quote: "ok.",
          reads:
            "One word with a hard period reads flat or distant after a real message — though it can just mean busy.",
        },
      ],
      confidence: 38,
      upset: "probably",
      upsetReason:
        "The period and brevity can feel cold, but short texts often mean 'busy,' not 'upset.' Genuinely low certainty.",
      wants:
        "Unclear — possibly a little space, possibly nothing at all. They haven't given you much to work with.",
      urgency: "low",
      crisisFlag: false,
    },
    replies: {
      warm: "all good! 😄 lmk if you wanna hang sometime this week",
      professional: "No worries — talk soon!",
      firm: "Cool. Let me know if you want to make a plan — otherwise no rush.",
    },
  },
  {
    id: "mom-fine",
    label: '"Fine. Do whatever you want."',
    sender: "family",
    message: "Fine. Do whatever you want.",
    decode: {
      meaning:
        "This is not actually permission. It usually means they're hurt or worn down and have stopped arguing — they want you to notice and care, not to literally do whatever you want.",
      tones: ["hurt", "frustrated"],
      tells: [
        {
          quote: "Fine.",
          reads:
            "'Fine.' on its own is rarely fine — it signals they've stopped arguing, not that they agree.",
        },
        {
          quote: "Do whatever you want",
          reads:
            "This is withdrawal, not permission — they want you to notice and push back, not take them literally.",
        },
      ],
      confidence: 80,
      upset: "yes",
      upsetReason:
        "'Fine' plus 'do whatever you want' is classic withdrawal — disappointment, not genuine agreement.",
      wants:
        "For you to acknowledge their feelings and show their opinion still matters to you.",
      urgency: "medium",
      crisisFlag: false,
    },
    replies: {
      warm: "Mom, I can tell you're upset and I don't want to just brush past that. Can we talk? What you think really does matter to me.",
      professional:
        "I don't want to leave it here when you're clearly upset. Can we talk it through? I do care what you think.",
      firm: "I hear that you're frustrated. I'd rather talk this through properly than leave it like this.",
    },
  },
  {
    id: "friend-cancel",
    label: "Friend cancels last-minute",
    sender: "friend",
    message: "hey sorry something came up, can't make it tonight 😬",
    decode: {
      meaning:
        "A genuine-sounding cancellation. 'Something came up' is vague, but the apology and the nervous emoji suggest they actually feel bad — not that they're blowing you off.",
      tones: ["apologetic", "sincere"],
      tells: [
        {
          quote: "sorry",
          reads:
            "A genuine apology up front — they feel bad about it, they're not blowing you off.",
        },
        {
          quote: "😬",
          reads:
            "The nervous grimace shows they're uncomfortable letting you down.",
        },
      ],
      confidence: 70,
      upset: "no",
      upsetReason: "They're apologizing to you, not upset with you.",
      wants: "Reassurance that it's okay, and probably a rain check.",
      urgency: "low",
      crisisFlag: false,
    },
    replies: {
      warm: "no worries at all!! stuff happens 💛 let's reschedule — are you free this weekend?",
      professional:
        "Totally understand — no problem at all. Let's find another time; does this weekend work?",
      firm: "All good. Let's lock in another day though — how's Saturday?",
    },
  },
  {
    id: "teammate",
    label: '"I\'ll just do it myself."',
    sender: "coworker",
    message: "don't worry about it, I'll just do it myself. it's fine.",
    decode: {
      meaning:
        "It is almost certainly not fine. This signals they feel they're carrying the work — they want you to step up and take your share, not to actually hand it all to them.",
      tones: ["frustrated", "passive-aggressive"],
      tells: [
        {
          quote: "I'll just do it myself",
          reads:
            "Classic resentment — they feel they're carrying the load and want you to step up, not actually take over.",
        },
        {
          quote: "it's fine",
          reads:
            "'It's fine' right after that is the opposite of fine — it's a test to see whether you'll notice.",
        },
      ],
      confidence: 82,
      upset: "yes",
      upsetReason:
        "'I'll just do it myself' plus 'it's fine' is resentment about an uneven workload.",
      wants:
        "For you to acknowledge the imbalance and actually take on a concrete piece of the work.",
      urgency: "medium",
      crisisFlag: false,
    },
    replies: {
      warm: "Hey, I really don't want to leave you holding all of this — that's not fair to you. Tell me which parts to take and I'll have them done by tomorrow.",
      professional:
        "I don't want you carrying this alone. Please let me own a concrete piece — which sections should I take? I'll have them done by tomorrow.",
      firm: "Let's split this properly. I'll take two sections and have them done by tomorrow — send me anything I'm missing.",
    },
  },
];

export function findSample(message: string): DemoSample | undefined {
  const norm = message.trim().toLowerCase();
  return SAMPLES.find((s) => s.message.trim().toLowerCase() === norm);
}

/** Generic decode used in demo-safe mode when input doesn't match a sample. */
export const GENERIC_DEMO_DECODE: DecodeResult = {
  meaning:
    "On the surface this is straightforward, but the tone suggests there's a little more underneath. Read it as sincere unless you have history that says otherwise.",
  tones: ["neutral", "sincere"],
  tells: [],
  confidence: 45,
  upset: "no",
  upsetReason:
    "Nothing here clearly signals anger toward you — but there isn't much context to be sure.",
  wants: "A clear, friendly response so you're both on the same page.",
  urgency: "low",
  crisisFlag: false,
};

export const GENERIC_DEMO_REPLIES: Record<ReplyTone, string> = {
  warm: "Thanks for letting me know! Totally on the same page — let me know if there's anything you need from me. 😊",
  professional:
    "Thank you for the message. I understand — please let me know if there's anything you'd like me to do next.",
  firm: "Got it, thanks. Let me know the next step and I'll take care of my part.",
};

export const DEMO_PRESEND: PreSendResult = {
  landing:
    "This comes across as clear and direct — the other person will understand exactly what you mean. Depending on your history, the directness could read as slightly cool.",
  risks: [
    "Without a softening word, a sensitive reader might take it as a little curt.",
    "If they were hoping for warmth, the brevity could feel distant.",
  ],
  softer:
    "Hey — just wanted to be upfront about where I'm at on this. No pressure at all, and I'm happy to talk it through whenever works for you!",
};
