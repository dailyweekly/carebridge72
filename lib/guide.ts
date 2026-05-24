import messages from "@/data/messages.mock.json";
import type { CareResource, DiagnosisGroup, FamilyGuide, Language, Patient, RiskResult } from "./types";
import { bandLabels, regionLabels } from "./labels";
import { validateLegalSafety } from "./legal";

const templates = messages as Record<Language, Partial<Record<DiagnosisGroup | "default", string>>>;

export function generateFamilyGuide(
  patient: Patient,
  risk: RiskResult,
  candidates: CareResource[],
  lang: Language = patient.preferredLanguage
): FamilyGuide {
  const language = templates[lang] ? lang : "ko";
  const base = selectTemplate(language, patient.primaryDiagnosisGroup);
  const lines = [
    base,
    "",
    renderContextLine(language, patient, risk, candidates)
  ];
  const text = lines.join("\n");
  const safety = validateLegalSafety({ text });

  return {
    text: safety.pass ? text : "운영 원칙 확인 필요 - 담당자 검토 필요",
    language,
    safety,
    sourceUrls: [
      "https://www.mohw.go.kr",
      "https://opendata.hira.or.kr"
    ],
    updatedAt: "2026-05-23"
  };
}

function selectTemplate(language: Language, diagnosis: DiagnosisGroup) {
  return templates[language][diagnosis] ?? templates[language].default ?? templates.ko.default ?? "";
}

function renderContextLine(
  lang: Language,
  patient: Patient,
  risk: RiskResult,
  candidates: CareResource[]
) {
  const region = regionLabels[patient.region];
  const resourceCount = candidates.length;
  const signalLabel = bandLabels[risk.band];

  if (lang === "en") {
    return `Care desk note: this ${region} case is marked as ${signalLabel} priority. Please check early contact and daily support gaps. ${resourceCount} candidate records are for staff review.`;
  }

  if (lang === "vi") {
    return `Ghi chu cua bo phan cham soc: truong hop tai ${region} duoc danh dau muc ${signalLabel}. Hay kiem tra lien lac ban dau va khoang trong ho tro sinh hoat. ${resourceCount} muc thong tin la de nhan vien phu trach xem xet.`;
  }

  if (lang === "zh") {
    return `公共照护窗口备注: ${region}个案标记为${signalLabel}优先级。请先确认早期联系和日常支持缺口。${resourceCount}条候选信息仅供工作人员审核。`;
  }

  return `담당자 확인 메모: ${region} 사례는 ${signalLabel} 우선순위로 표시되었습니다. 초기 연락과 생활지원 공백을 확인하고, 후보 정보 ${resourceCount}건은 담당자 검토용으로만 사용합니다.`;
}
