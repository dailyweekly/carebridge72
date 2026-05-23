import { describe, expect, it } from "vitest";
import { validateLegalSafety } from "@/lib/legal";

describe("validateLegalSafety", () => {
  it("fails on direct hospital placement wording", () => {
    const result = validateLegalSafety({ text: "병원 추천 문구" });
    expect(result.pass).toBe(false);
  });

  it("fails on legal advisory wording", () => {
    const result = validateLegalSafety({ text: "법률 자문 제공" });
    expect(result.pass).toBe(false);
  });

  it("passes empty text", () => {
    const result = validateLegalSafety({ text: "" });
    expect(result.pass).toBe(true);
  });
});
