import { NextRequest } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/llm";
import { DecodeResultSchema, REPLY_TONES, SENDERS } from "@/lib/schema";

export const runtime = "nodejs";

const BodySchema = z.object({
  message: z.string().min(1).max(4000),
  decode: DecodeResultSchema,
  tone: z.enum(REPLY_TONES),
  sender: z.enum(SENDERS).optional(),
});

export async function POST(req: NextRequest) {
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
    return Response.json(
      { error: "Couldn't draft a reply right now." },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of provider.reply(body)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (e) {
        // Privacy: log only the error, never the message content.
        console.error(
          "[reply] stream error:",
          e instanceof Error ? e.message : String(e),
        );
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
