import messages from "@/data/messages.mock.json";
import type { CareResource, FamilyGuide, Language, Patient, RiskResult } from "./types";
import { languageLabels, regionLabels } from "./labels";
import { validateLegalSafety } from "./legal";

const templates = messages as Record<Language, { default: string }>;

export function generateFamilyGuide(
  patient: Patient,
  risk: RiskResult,
  candidates: CareResource[],
  lang: Language = patient.preferredLanguage
): FamilyGuide {
  const language = templates[lang] ? lang : "ko";
  const base = templates[language].default;
  const lines = [
    base,
    "",
    renderContextLine(language, patient, risk, candidates)
  ];
  const text = lines.join("\n");
  const safety = validateLegalSafety({ text });

  return {
    text: safety.pass ? text : "안전선 검사 실패 - 담당자 검토 필요",
    language,
    safety,
    sourceUrls: [
      "https://www.mohw.go.kr",
      "https://opendata.hira.or.kr"
    ],
    updatedAt: "2026-05-23"
  };
}

function renderContextLine(
  lang: Language,
  patient: Patient,
  risk: RiskResult,
  candidates: CareResource[]
) {
  const region = regionLabels[patient.region];
  const resourceCount = candidates.length;

  if (lang === "en") {
    return `Public care desk note: pseudonym ${patient.id}, ${region}, ${risk.band} signal, ${resourceCount} candidate resource records, language ${languageLabels[lang]}.`;
  }

  if (lang === "vi") {
    return `Ghi chu bo phan cham soc cong: ma gia danh ${patient.id}, khu vuc ${region}, tin hieu ${risk.band}, ${resourceCount} ban ghi nguon luc ung vien, ngon ngu ${languageLabels[lang]}.`;
  }

  if (lang === "zh") {
    return `公共照护窗口备注: 匿名编号 ${patient.id}, 地区 ${region}, ${risk.band} 信号, ${resourceCount} 条候选资源记录, 语言 ${languageLabels[lang]}.`;
  }

  return `공공 담당자 메모: 가명 ${patient.id}, ${region}, ${risk.band} 신호, 후보 자원 ${resourceCount}건, 안내 언어 ${languageLabels[lang]}.`;
}
