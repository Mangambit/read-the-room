import { NextRequest } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/llm";
import { createDemoProvider } from "@/lib/llm/demo";
import { SENDERS, AGES } from "@/lib/schema";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const BodySchema = z
  .object({
    message: z.string().max(4000).default(""),
    image: z.string().max(4_000_000).optional(), // data URL of a screenshot
    sender: z.enum(SENDERS).optional(),
    age: z.enum(AGES).optional(),
  })
  .refine((b) => b.message.trim().length > 0 || Boolean(b.image), {
    message: "Provide a message or a screenshot.",
  });

export async function POST(req: NextRequest) {
  if (!rateLimit(clientIp(req))) {
    return Response.json(
      { error: "You're going a little fast — give it a few seconds and try again." },
      { status: 429, headers: CORS },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return Response.json(
      { error: "Please paste a message (up to 4000 characters)." },
      { status: 400, headers: CORS },
    );
  }

  try {
    const provider = getProvider();
    const result = await provider.decode(body);
    return Response.json(
      { result, provider: provider.name, demo: provider.isDemo },
      { headers: CORS },
    );
  } catch (e) {
    // Privacy: log only the error, never message content.
    console.error(
      "[decode] provider error:",
      e instanceof Error ? e.message : String(e),
    );
    // Graceful degrade to demo-safe mode instead of failing (covers a dead /
    // rate-limited / slow API). The UI shows a "saved example" banner.
    try {
      const demo = createDemoProvider();
      const result = await demo.decode(body);
      return Response.json(
        { result, provider: demo.name, demo: true },
        { headers: CORS },
      );
    } catch {
      return Response.json(
        { error: "I couldn't read that one. Try again in a moment." },
        { status: 502, headers: CORS },
      );
    }
  }
}
