import { NextRequest } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/llm";
import { createDemoProvider } from "@/lib/llm/demo";
import {
  DecodeResultSchema,
  REPLY_TONES,
  REPLY_GOALS,
  SENDERS,
} from "@/lib/schema";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  message: z.string().min(1).max(4000),
  decode: DecodeResultSchema,
  tone: z.enum(REPLY_TONES),
  goal: z.enum(REPLY_GOALS).optional(),
  sender: z.enum(SENDERS).optional(),
});

export async function POST(req: NextRequest) {
  if (!rateLimit(clientIp(req))) {
    return Response.json(
      { error: "You're going a little fast — give it a few seconds and try again." },
      { status: 429 },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  let provider;
  try {
    provider = getProvider();
  } catch (e) {
    console.error(
      "[reply] provider init error:",
      e instanceof Error ? e.message : String(e),
    );
    provider = createDemoProvider();
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let yielded = false;
      try {
        for await (const chunk of provider.reply(body)) {
          yielded = true;
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (e) {
        // Privacy: log only the error, never message content.
        console.error(
          "[reply] stream error:",
          e instanceof Error ? e.message : String(e),
        );
        // If nothing streamed yet (e.g. rate-limit/timeout up front), degrade
        // to a demo-safe reply instead of erroring.
        if (!yielded) {
          try {
            const demo = createDemoProvider();
            for await (const chunk of demo.reply(body)) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
            return;
          } catch {
            // fall through to error
          }
        }
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
