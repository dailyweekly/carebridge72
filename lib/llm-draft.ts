import { categoryLabels, diagnosisLabels, regionLabels } from "./labels";
import { assertSafeText, validateLegalSafety } from "./legal";
import type { CareResource, FamilyGuide, Patient, RiskResult } from "./types";

export type DraftKind = "handoff" | "family";

export type DraftRequest = {
  kind: DraftKind;
  patient: Patient;
  risk: RiskResult;
  candidates: CareResource[];
  guide?: FamilyGuide;
  memo?: string;
};

export type DraftResponse = {
  kind: DraftKind;
  text: string;
  source: "openai" | "fallback";
  model: string;
  safetyPass: boolean;
  blocked: boolean;
  generatedAt: string;
};

const fallbackModel = "deterministic-fallback";

export async function createLlmDraft(input: DraftRequest): Promise<DraftResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";

  if (!apiKey) {
    return finalizeDraft(input, buildFallbackDraft(input), "fallback", fallbackModel);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        instructions: buildInstructions(input.kind),
        input: buildPrompt(input),
        max_output_tokens: 900
      })
    });

    if (!response.ok) {
      return finalizeDraft(input, buildFallbackDraft(input), "fallback", `${fallbackModel}:http-${response.status}`);
    }

    const payload = await response.json();
    const text = extractOutputText(payload) || buildFallbackDraft(input);
    return finalizeDraft(input, text, "openai", model);
  } catch {
    return finalizeDraft(input, buildFallbackDraft(input), "fallback", `${fallbackModel}:network`);
  }
}

export function buildFallbackDraft(input: DraftRequest) {
  const candidates = input.candidates.slice(0, 3);
  const topReasons = input.risk.reasons.slice(0, 3).join(", ");
  const candidateLine = candidates
    .map((item) => `${categoryLabels[item.category]}(${item.distanceKm.toFixed(1)}km)`)
    .join(", ");

  if (input.kind === "family") {
    return [
      "퇴원 후 첫 72시간 동안 식사, 수분 섭취, 휴식, 외래 방문 준비를 확인해주세요.",
      "호흡 곤란, 심한 어지러움, 갑작스러운 의식 변화처럼 응급 신호가 보이면 즉시 응급 서비스 또는 담당 공공 창구에 연락해주세요.",
      `오늘 확인할 항목은 식사 가능 여부, 이동 가능 여부, 연락 가능한 보호자 또는 담당자 여부입니다.`,
      `공공 담당자는 ${regionLabels[input.patient.region]} 지역의 후보 정보를 검토한 뒤 필요한 안내를 별도로 전달합니다.`
    ].join("\n");
  }

  return [
    `사례 ${input.patient.id}: ${regionLabels[input.patient.region]} ${diagnosisLabels[input.patient.primaryDiagnosisGroup]}, ${input.risk.band} ${input.risk.score}점.`,
    `핵심 확인 사유: ${topReasons}.`,
    `우선 확인 항목: 퇴원 후 72시간 내 연락 가능성, 식사·이동 공백, 외래 방문 준비.`,
    `검토 후보: ${candidateLine || "지역 후보 정보 확인 필요"}.`,
    `담당자 메모: ${input.memo?.trim() || "원자료 확인 후 가족 안내 여부를 결정합니다."}`
  ].join("\n");
}

function buildInstructions(kind: DraftKind) {
  const purpose =
    kind === "handoff"
      ? "시군 통합돌봄 또는 병원 사회사업실 담당자에게 전달할 인계 요약 초안을 작성한다."
      : "가족에게 전달하기 전 담당자가 검토할 쉬운 안내문 초안을 작성한다.";

  return [
    purpose,
    "의료적 진단, 약물명, 용량, 치료 지시는 생성하지 않는다.",
    "특정 의료기관이나 장기요양기관을 지정하거나 연결, 예약, 결제하도록 쓰지 않는다.",
    "후보 정보는 담당자 검토 대상이라고 표현한다.",
    "최종 판단과 전달은 담당자가 수행한다고 명확히 쓴다.",
    "한국어로 5문장 이내, 실무자가 바로 붙여넣을 수 있는 문장으로 작성한다."
  ].join("\n");
}

function buildPrompt(input: DraftRequest) {
  return JSON.stringify(
    {
      kind: input.kind,
      patient: {
        id: input.patient.id,
        age: input.patient.age,
        dischargeDate: input.patient.dischargeDate,
        region: regionLabels[input.patient.region],
        diagnosisGroup: diagnosisLabels[input.patient.primaryDiagnosisGroup],
        caregiverPresent: input.patient.caregiverPresent,
        livingArrangement: input.patient.livingArrangement,
        preferredLanguage: input.patient.preferredLanguage,
        notes: input.patient.notes
      },
      risk: {
        score: input.risk.score,
        band: input.risk.band,
        reasons: input.risk.reasons
      },
      candidates: input.candidates.slice(0, 5).map((item) => ({
        category: categoryLabels[item.category],
        distanceKm: item.distanceKm,
        publicContact: item.publicContact,
        operatingWindow: item.operatingWindow,
        notes: item.notes
      })),
      memo: input.memo ?? ""
    },
    null,
    2
  );
}

function finalizeDraft(
  input: DraftRequest,
  rawText: string,
  source: DraftResponse["source"],
  model: string
): DraftResponse {
  const safeText = assertSafeText(rawText.trim());
  const safety = validateLegalSafety({ text: safeText });
  const blocked = !safety.pass || safeText.includes("운영 원칙 확인 필요");

  return {
    kind: input.kind,
    text: safeText,
    source,
    model,
    safetyPass: !blocked,
    blocked,
    generatedAt: new Date().toISOString()
  };
}

function extractOutputText(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return "";
  const maybeText = (payload as { output_text?: unknown }).output_text;
  if (typeof maybeText === "string") return maybeText;

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) return [];
      return content.map((part) => {
        if (typeof part !== "object" || part === null) return "";
        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      });
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}
