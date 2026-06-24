import { describe, it, expect } from "vitest";
import { DecodeResultSchema } from "@/lib/schema";
import {
  SAMPLES,
  GENERIC_DEMO_DECODE,
  findSample,
} from "@/lib/demo-data";
import { createDemoProvider } from "@/lib/llm/demo";

describe("demo data integrity", () => {
  it("every sample decode satisfies the schema", () => {
    for (const s of SAMPLES) {
      expect(() => DecodeResultSchema.parse(s.decode)).not.toThrow();
    }
  });

  it("the generic demo decode satisfies the schema", () => {
    expect(() => DecodeResultSchema.parse(GENERIC_DEMO_DECODE)).not.toThrow();
  });

  it("sample ids are unique", () => {
    const ids = SAMPLES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("findSample matches case-insensitively and trims", () => {
    const first = SAMPLES[0];
    expect(findSample("  " + first.message.toUpperCase() + "  ")?.id).toBe(
      first.id,
    );
  });
});

describe("demo provider", () => {
  it("decodes a known sample with its canned analysis", async () => {
    const p = createDemoProvider();
    const out = await p.decode({ message: SAMPLES[0].message });
    expect(out).toEqual(SAMPLES[0].decode);
    expect(p.isDemo).toBe(true);
  });

  it("returns a schema-valid generic decode for unknown input", async () => {
    const p = createDemoProvider();
    const out = await p.decode({ message: "something random nobody wrote" });
    expect(() => DecodeResultSchema.parse(out)).not.toThrow();
  });

  it("streams a non-empty reply", async () => {
    const p = createDemoProvider();
    let text = "";
    for await (const chunk of p.reply({
      message: SAMPLES[0].message,
      decode: SAMPLES[0].decode,
      tone: "warm",
    })) {
      text += chunk;
    }
    expect(text.length).toBeGreaterThan(10);
    expect(text).toBe(SAMPLES[0].replies.warm);
  });
});
