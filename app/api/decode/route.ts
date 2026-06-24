import { NextRequest } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/llm";
import { SENDERS } from "@/lib/schema";

export const runtime = "nodejs";

// Allow the browser extension (and any client) to call this stateless endpoint.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const BodySchema = z.object({
  message: z.string().min(1).max(4000),
  sender: z.enum(SENDERS).optional(),
});

export async function POST(req: NextRequest) {
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
    // Privacy: never log message content — only the error.
    console.error(
      "[decode] provider error:",
      e instanceof Error ? e.message : String(e),
    );
    return Response.json(
      { error: "I couldn't read that one. Try again, or tap an example below." },
      { status: 502, headers: CORS },
    );
  }
}
