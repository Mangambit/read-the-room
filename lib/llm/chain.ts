import type { LlmProvider } from "./types";

/**
 * Tries providers in order, falling back to the next on any error (e.g. a 429
 * daily-cap or timeout). The route-level demo fallback is the final safety net.
 */
export function createChainProvider(providers: LlmProvider[]): LlmProvider {
  if (providers.length === 1) return providers[0];

  return {
    name: `chain[${providers.map((p) => p.name).join(" -> ")}]`,
    isDemo: providers.every((p) => p.isDemo),

    async decode(input) {
      let lastErr: unknown;
      for (const p of providers) {
        try {
          return await p.decode(input);
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr;
    },

    async presend(input) {
      let lastErr: unknown;
      for (const p of providers) {
        try {
          return await p.presend(input);
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr;
    },

    async *reply(input) {
      let lastErr: unknown;
      for (const p of providers) {
        let yielded = false;
        try {
          for await (const chunk of p.reply(input)) {
            yielded = true;
            yield chunk;
          }
          return;
        } catch (e) {
          lastErr = e;
          // If this provider already streamed partial output, we can't cleanly
          // switch — surface the error (route may still demo-fallback if nothing
          // reached the client yet).
          if (yielded) throw e;
        }
      }
      throw lastErr;
    },
  };
}
