import rules from "@/data/legal_safety_rules.json";
import type { LegalFlag, LegalValidation } from "./types";

const legalRules = rules as { level: "RED" | "YELLOW"; pattern: string; replace: string }[];

export function validateLegalSafety({ text }: { text: string }): LegalValidation {
  if (!text.trim()) {
    return { pass: true, flagged: [] };
  }

  const flagged: LegalFlag[] = [];

  for (const rule of legalRules) {
    const regexp = new RegExp(rule.pattern, "giu");
    const matches = text.matchAll(regexp);
    for (const match of matches) {
      flagged.push({
        level: rule.level,
        pattern: rule.pattern,
        snippet: match[0]
      });
    }
  }

  return {
    pass: flagged.length === 0,
    flagged
  };
}

export function assertSafeText(text: string): string {
  const validation = validateLegalSafety({ text });
  if (!validation.pass) {
    return "안전선 검사 실패 - 담당자 검토 필요";
  }
  return text;
}
