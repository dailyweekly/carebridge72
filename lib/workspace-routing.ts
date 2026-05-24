import type { Language, Patient } from "@/lib/types";

export function buildWorkspaceHref(patientId: string, language: Exclude<Language, "ko">) {
  return `/workspace?patient=${encodeURIComponent(patientId)}&lang=${encodeURIComponent(language)}`;
}

export function resolveWorkspaceLanguage(
  patient: Patient,
  requestedLanguage?: Language
): Exclude<Language, "ko"> {
  if (requestedLanguage && requestedLanguage !== "ko") return requestedLanguage;
  if (patient.preferredLanguage !== "ko") return patient.preferredLanguage;
  return "en";
}
