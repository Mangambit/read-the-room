import { NextRequest } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/llm";
import { createDemoProvider } from "@/lib/llm/demo";
import { SENDERS, AGES } from "@/lib/schema";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  draft: z.string().min(1).max(4000),
  original: z.string().max(4000).optional(),
  sender: z.enum(SENDERS).optional(),
  age: z.enum(AGES).optional(),
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
    return Response.json(
      { error: "Please paste the reply you're about to send." },
      { status: 400 },
    );
  }

  try {
    const provider = getProvider();
    const result = await provider.presend(body);
    return Response.json({
      result,
      provider: provider.name,
      demo: provider.isDemo,
    });
  } catch (e) {
    console.error(
      "[presend] provider error:",
      e instanceof Error ? e.message : String(e),
    );
    try {
      const demo = createDemoProvider();
      const result = await demo.presend(body);
      return Response.json({ result, provider: demo.name, demo: true });
    } catch {
      return Response.json(
        { error: "I couldn't check that one. Try again in a moment." },
        { status: 502 },
      );
    }
  }
}
