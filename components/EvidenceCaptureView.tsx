import { CalendarDays } from "lucide-react";
import { CaptureCaption } from "./CaptureCaption";
import { CareCandidateList } from "./CareCandidateList";
import { FamilyGuidePanel } from "./FamilyGuidePanel";
import { RiskResultCard } from "./RiskResultCard";
import { comorbidityLabels, diagnosisLabels, livingArrangementLabels, regionLabels } from "@/lib/labels";
import type { CareResource, FamilyGuide, Patient, RiskResult } from "@/lib/types";

type EvidenceCaptureViewProps = {
  patient: Patient;
  risk: RiskResult;
  candidates: CareResource[];
  koreanGuide: FamilyGuide;
  foreignGuide: FamilyGuide;
  compact: boolean;
};

export function EvidenceCaptureView({
  patient,
  risk,
  candidates,
  koreanGuide,
  foreignGuide,
  compact
}: EvidenceCaptureViewProps) {
  return (
    <section
      id="evidence"
      className={`mt-6 rounded-md border border-line bg-white p-4 shadow-soft ${compact ? "" : "capture-watermark"}`}
    >
      <CaptureCaption
        title="통합 사례 화면"
        description="입력 항목부터 모델 결과, 안전선, 가족 안내문까지 한 화면에 표시합니다."
      />
      <div className="mb-4 flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal">CareBridge72</p>
          <h2 className="text-xl font-black text-ink">사례 검토 요약</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1">
            <CalendarDays size={14} />
            2026-05-23
          </span>
          <span className="rounded-md border border-line bg-white px-2 py-1">가명 사례 {patient.id}</span>
        </div>
      </div>

      <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <InfoCell label="나이·퇴원일" value={`${patient.age}세 · ${patient.dischargeDate}`} />
        <InfoCell label="진단군" value={diagnosisLabels[patient.primaryDiagnosisGroup]} />
        <InfoCell label="지역" value={regionLabels[patient.region]} />
        <InfoCell label="생활환경" value={livingArrangementLabels[patient.livingArrangement]} />
        <InfoCell
          label="동반질환"
          value={patient.comorbidities.map((item) => comorbidityLabels[item]).join(", ")}
        />
        <InfoCell label="돌봄자" value={patient.caregiverPresent ? "상주 돌봄자 있음" : "상주 돌봄자 없음"} />
        <InfoCell label="선호 언어" value={patient.preferredLanguage} />
        <InfoCell label="비고" value={patient.notes || "없음"} />
      </div>

      {!compact ? (
        <div className="grid gap-4">
          <RiskResultCard risk={risk} patient={patient} showScreenNote />
          <CareCandidateList
            candidates={candidates}
            regionLabel={candidates[0]?.regionLabel ?? ""}
            rationale="현재 사례의 후보 정보와 위험 신호를 함께 검토합니다."
            showScreenNote
          />
          <FamilyGuidePanel koreanGuide={koreanGuide} foreignGuide={foreignGuide} showScreenNote />
        </div>
      ) : (
        <p className="text-sm leading-6 text-slate-600">
          `/capture` 경로에서 동일 데이터를 통합 사례 화면으로 볼 수 있습니다.
        </p>
      )}
    </section>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
