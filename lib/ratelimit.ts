/**
 * Tiny in-memory per-IP fixed-window limiter. Defense-in-depth so a single
 * client can't burn the API key. On serverless this is per-instance (not
 * global) — adequate for a hackathon demo; pair with demo-safe deploy for the
 * public link.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 25;

const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(ip: string): boolean {
  const now = Date.now();
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
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}
