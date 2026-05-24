import { describe, expect, it } from "vitest";
import patients from "@/data/patients.mock.json";
import { buildWorkspaceHref, resolveWorkspaceLanguage } from "@/lib/workspace-routing";
import type { Patient } from "@/lib/types";

const patientList = patients as Patient[];

describe("workspace routing", () => {
  it("keeps the selected case and foreign language when moving to the workspace", () => {
    expect(buildWorkspaceHref("P002", "zh")).toBe("/workspace?patient=P002&lang=zh");
  });

  it("uses the patient's preferred foreign language when present", () => {
    const patient = patientList.find((item) => item.id === "P002");
    expect(patient).toBeDefined();
    expect(resolveWorkspaceLanguage(patient!, undefined)).toBe("zh");
  });

  it("falls back to English when the selected case uses Korean as the base language", () => {
    const patient = patientList.find((item) => item.id === "P005");
    expect(patient).toBeDefined();
    expect(resolveWorkspaceLanguage(patient!, "ko")).toBe("en");
  });
});
