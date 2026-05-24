import { describe, expect, it } from "vitest";
import { submissionEvidence } from "@/lib/submission-evidence";

describe("submission evidence metadata", () => {
  it("uses the current submission date for capture evidence", () => {
    expect(submissionEvidence.preparedAt).toBe("2026-05-25");
  });

  it("states the evidence purpose without exposing private details", () => {
    expect(submissionEvidence.purpose).toContain("시제품 증빙");
    expect(JSON.stringify(submissionEvidence)).not.toMatch(/hanmail|010-|주민번호|API_KEY/i);
  });
});
