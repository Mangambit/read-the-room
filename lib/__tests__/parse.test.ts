import { describe, it, expect } from "vitest";
import { extractJsonObject, parseDecode } from "@/lib/parse";

const valid = {
  meaning: "They are annoyed you missed the deadline.",
  tones: ["frustrated"],
  confidence: 80,
  upset: "yes",
  upsetReason: "Pointed wording.",
  wants: "An apology and the work submitted.",
  urgency: "high",
  crisisFlag: false,
};

describe("extractJsonObject", () => {
  it("parses clean JSON", () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses JSON wrapped in ```json fences", () => {
    const raw = '```json\n{"a":1,"b":"x"}\n```';
    expect(extractJsonObject(raw)).toEqual({ a: 1, b: "x" });
  });

  it("parses JSON wrapped in bare ``` fences", () => {
    expect(extractJsonObject("```\n{\"a\":2}\n```")).toEqual({ a: 2 });
  });

  it("parses JSON with prose before and after", () => {
    const raw = 'Sure! Here is the result:\n{"a":3}\nHope that helps.';
    expect(extractJsonObject(raw)).toEqual({ a: 3 });
  });

  it("handles braces inside string values", () => {
    const raw = '{"text":"a } b { c","n":1}';
    expect(extractJsonObject(raw)).toEqual({ text: "a } b { c", n: 1 });
  });

  it("handles escaped quotes inside string values", () => {
    const raw = '{"text":"she said \\"hi\\"","n":1}';
    expect(extractJsonObject(raw)).toEqual({ text: 'she said "hi"', n: 1 });
  });

  it("handles a trailing escaped backslash in a string", () => {
    const raw = '{"text":"path\\\\","n":2}';
    expect(extractJsonObject(raw)).toEqual({ text: "path\\", n: 2 });
  });

  it("throws on garbage with no JSON object", () => {
    expect(() => extractJsonObject("no json here")).toThrow();
  });

  it("throws on unbalanced JSON", () => {
    expect(() => extractJsonObject('{"a":1')).toThrow();
  });
});

describe("parseDecode", () => {
  it("validates a well-formed decode", () => {
    expect(parseDecode(JSON.stringify(valid))).toMatchObject({
      upset: "yes",
      urgency: "high",
    });
  });

  it("parses a fenced, prose-wrapped decode", () => {
    const raw = "Here you go:\n```json\n" + JSON.stringify(valid) + "\n```";
    expect(parseDecode(raw).confidence).toBe(80);
  });

  it("rejects an out-of-range confidence", () => {
    expect(() => parseDecode(JSON.stringify({ ...valid, confidence: 150 }))).toThrow();
  });

  it("rejects a bad enum value", () => {
    expect(() => parseDecode(JSON.stringify({ ...valid, upset: "maybe" }))).toThrow();
  });
});
