import { AlertTriangle, CheckCircle2, Gauge, Info } from "lucide-react";
import { CaptureCaption } from "./CaptureCaption";
import { assessCaseReview } from "@/lib/case-review";
import { bandLabels, diagnosisLabels, regionLabels } from "@/lib/labels";
import type { Patient, RiskResult } from "@/lib/types";

type RiskResultCardProps = {
  risk: RiskResult;
  patient: Patient;
  showScreenNote?: boolean;
};

export function RiskResultCard({ risk, patient, showScreenNote = false }: RiskResultCardProps) {
  const reviewSignal = assessCaseReview(patient, risk);
  const action = getPrimaryAction(risk.band);
  const tone =
    risk.band === "HIGH"
      ? "border-cranberry bg-rose-50 text-cranberry"
      : risk.band === "MEDIUM"
        ? "border-amber-500 bg-amber-50 text-amber-800"
        : "border-teal bg-teal-50 text-teal";

  return (
    <section id="risk" className="scroll-mt-20 rounded-md border border-line bg-white p-4 shadow-soft">
      {showScreenNote ? (
        <CaptureCaption
          title="화면 02 · 위험 검토"
          description="위험 신호, 핵심 근거, 해석 가능 규칙과 모델 버전을 함께 표시합니다."
        />
      ) : null}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="text-teal" size={20} />
            <h2 className="text-lg font-bold text-ink">재입원 위험 신호</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {patient.id} · {regionLabels[patient.region]} · {diagnosisLabels[patient.primaryDiagnosisGroup]}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_192px]">
          <div className="rounded-md border border-line bg-panel px-3 py-2 text-sm">
            <p className="text-xs font-bold text-slate-500">사례 검토 상태</p>
            <p className="mt-1 font-bold text-ink">{reviewSignal.windowStatus}</p>
            <p className="mt-1 text-xs text-slate-600">
              퇴원 후 {reviewSignal.elapsedHours}h · {formatRemainingHours(reviewSignal.remainingHours)}
            </p>
          </div>
          <div className={`flex min-w-48 items-center justify-between rounded-md border px-4 py-3 ${tone}`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-normal">{bandLabels[risk.band]}</p>
              <p className="text-3xl font-black">{risk.score}</p>
            </div>
            {risk.band === "HIGH" ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-md border border-line bg-panel p-3 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-black text-slate-500">업무 결론</p>
          <p className="mt-1 text-lg font-black text-ink">{action.title}</p>
        </div>
        <p className="text-sm leading-6 text-slate-700">{action.detail}</p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-3">
        {risk.reasons.map((reason, index) => (
          <li key={reason} className="rounded-md border border-line bg-panel p-3 text-sm leading-6 text-slate-700">
            <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-teal">
              {index + 1}
            </span>
            <p>{reason}</p>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-md border border-line bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
            <Info size={16} className="text-teal" />
            해석 가능 규칙 가중치
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {risk.factors.map((factor) => (
              <div key={`${factor.axis}-${factor.label}`} className="flex justify-between gap-3 rounded-md bg-panel px-3 py-2 text-sm">
                <span className="text-slate-700">{factor.label}</span>
                <span className={factor.points >= 0 ? "font-bold text-cranberry" : "font-bold text-teal"}>
                  {factor.points >= 0 ? "+" : ""}
                  {factor.points}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-line bg-panel p-3 text-sm leading-6 text-slate-700">
          <p className="font-bold text-ink">모델 버전</p>
          <p>{risk.modelVersion}</p>
          <p className="mt-2 font-bold text-ink">설명 신뢰도</p>
          <p>{Math.round(risk.confidence * 100)}%</p>
        </div>
      </div>
    </section>
  );
}

function formatRemainingHours(hours: number) {
  if (hours < 0) return `72시간 초과 ${Math.abs(hours)}h`;
  return `잔여 ${hours}h`;
}

function getPrimaryAction(band: RiskResult["band"]) {
  if (band === "HIGH") {
    return {
      title: "검토 필요",
      detail: "72시간 내 전화 확인, 식사·이동 공백, 가족 연락 가능 여부를 우선 확인합니다."
    };
  }
  if (band === "MEDIUM") {
    return {
      title: "추적 확인",
      detail: "외래 일정과 생활지원 공백을 확인하고, 필요 시 후보 자원을 보류 검토합니다."
    };
  }
  return {
    title: "기본 안내",
    detail: "일반 안내문을 전달하고, 증상 변화나 생활 공백이 생기면 담당 창구로 확인하도록 안내합니다."
  };
}
