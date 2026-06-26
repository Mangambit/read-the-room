/**
 * Tiny in-memory per-IP fixed-window limiter. Defense-in-depth so a single
 * client can't burn the API key. On serverless this is per-instance (not
 * global) — adequate for a hackathon demo; pair with demo-safe deploy for the
 * public link.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 25;

const hits = new Map<string, { count: number; reset: number }>();
// Backstop so the Map can't grow without bound on a long-lived instance.
const MAX_TRACKED_IPS = 5000;

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  if (hits.size > MAX_TRACKED_IPS) hits.clear();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count++;
  return true;
}

export function clientIp(req: Request): string {
  // On Vercel the trusted client IP is the LAST hop appended by the edge; the
  // leftmost XFF value is client-controlled and trivially spoofable.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",");
    return parts[parts.length - 1].trim();
  }
  return req.headers.get("x-real-ip") ?? "local";
}
