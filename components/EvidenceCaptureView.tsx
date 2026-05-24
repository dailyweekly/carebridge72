import { CalendarDays } from "lucide-react";
import { CaptureCaption } from "./CaptureCaption";
import { bandLabels, categoryLabels, comorbidityLabels, diagnosisLabels, livingArrangementLabels, regionLabels } from "@/lib/labels";
import { assessCaseReview } from "@/lib/case-review";
import { submissionEvidence } from "@/lib/submission-evidence";
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
  const safetyPass = koreanGuide.safety.pass && foreignGuide.safety.pass;
  const signal = assessCaseReview(patient, risk);

  return (
    <section
      id="evidence"
      className={`mx-auto mt-6 w-full max-w-[794px] rounded-md border border-line bg-white p-3 shadow-soft print:break-inside-avoid ${compact ? "" : "capture-watermark"}`}
    >
      <CaptureCaption
        title="별첨5 캡처 화면"
        description={`작성일: ${submissionEvidence.preparedAt} / 시연 기준: ${signal.referenceLabel} / 가명 데이터(P003) / 모델 버전: ${risk.modelVersion} / 운영 원칙 확인: 통과 / 본 화면은 ${submissionEvidence.purpose}용입니다.`}
      />
      <div className="mb-3 flex flex-col gap-2 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal">CareBridge72</p>
          <h2 className="text-xl font-black text-ink">사례 검토 요약</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1">
            <CalendarDays size={14} />
            {submissionEvidence.preparedAt}
          </span>
          <span className="rounded-md border border-line bg-white px-2 py-1">가명 사례 {patient.id}</span>
          <span className="rounded-md border border-line bg-white px-2 py-1">
            운영 원칙 확인: {safetyPass ? "통과" : "검토 필요"}
          </span>
        </div>
      </div>

      <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-4">
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
        <div className="grid gap-2">
          <section id="risk" className="rounded-md border border-line p-2 print:break-inside-avoid">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-teal">화면 02 · 위험 검토</p>
                <h3 className="mt-1 text-lg font-black text-ink">재입원 위험 신호 {bandLabels[risk.band]} {risk.score}점</h3>
                <p className="mt-1 text-sm text-slate-600">모델 버전 {risk.modelVersion} · 설명 신뢰도 {Math.round(risk.confidence * 100)}% · {signal.referenceLabel}</p>
              </div>
              <div className="rounded-md border border-cranberry bg-rose-50 px-4 py-2 text-right text-cranberry">
                <p className="text-xs font-bold">{bandLabels[risk.band]}</p>
                <p className="text-3xl font-black">{risk.score}</p>
              </div>
            </div>
            <ol className="mt-2 grid gap-2 md:grid-cols-3">
              {risk.reasons.map((reason) => (
                <li key={reason} className="rounded-md bg-panel p-2 text-xs leading-5 text-slate-700">
                  {reason}
                </li>
              ))}
            </ol>
          </section>

          <section id="candidates" className="rounded-md border border-line p-2 print:break-inside-avoid">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-teal">화면 03 · 자원 후보</p>
                <h3 className="mt-1 text-lg font-black text-ink">지역 돌봄 자원 후보 정보</h3>
              </div>
              <span className="rounded-md border border-line bg-panel px-3 py-1 text-sm font-bold text-slate-700">
                {candidates[0]?.regionLabel ?? ""} · {candidates.length}건
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              {candidates.slice(0, 5).map((candidate) => (
                <article key={candidate.id} className="rounded-md border border-line bg-panel p-2 text-xs">
                  <p className="font-bold text-teal">{categoryLabels[candidate.category]}</p>
                  <p className="text-[11px] font-bold text-slate-500">{candidate.id.startsWith("NHIS-LTC") ? "NHIS API" : "예비 후보"}</p>
                  <p className="font-semibold text-ink">{candidate.name}</p>
                  <p className="text-slate-600">{candidate.distanceKm.toFixed(1)}km · {candidate.operatingWindow}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="guide" className="rounded-md border border-line p-2 print:break-inside-avoid">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-teal">화면 04 · 가족 안내</p>
                <h3 className="mt-1 text-lg font-black text-ink">가족 안내문 및 운영 원칙 확인</h3>
              </div>
              <span className="rounded-md border border-line bg-panel px-3 py-1 text-sm font-bold text-slate-700">
                {safetyPass ? "통과" : "담당자 검토 필요"}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <GuideExcerpt title="한국어 안내" text={koreanGuide.text} />
              <GuideExcerpt title="외국어 안내" text={foreignGuide.text} />
            </div>
            <p className="mt-2 rounded-md bg-panel p-2 text-xs leading-5 text-slate-600">
              출처·갱신일: 공공 안내문 템플릿 (보건복지부·HIRA, {koreanGuide.updatedAt} 기준)
            </p>
          </section>

          <div className="rounded-md border border-teal bg-teal/5 p-2 text-sm font-bold leading-6 text-ink">
            최종 판단은 시군 통합돌봄 전담조직 또는 병원 사회사업실 담당자가 수행합니다.
          </div>
        </div>
      ) : (
        <p className="text-sm leading-6 text-slate-600">
          `/capture` 경로에서 동일 데이터를 통합 사례 화면으로 볼 수 있습니다.
        </p>
      )}
    </section>
  );
}

function GuideExcerpt({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-md border border-line bg-panel p-2 text-xs leading-5 text-slate-700">
      <p className="mb-1 font-bold text-ink">{title}</p>
      <p>{text.split("\n").slice(0, 2).join(" ").slice(0, 190)}...</p>
    </article>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-2">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
