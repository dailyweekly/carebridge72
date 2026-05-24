"use client";

import { CheckCircle2, ClipboardCheck, FileText, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { assessCaseReview } from "@/lib/case-review";
import { categoryLabels, regionLabels } from "@/lib/labels";
import type { CandidateReviewStatus, CareResource, Patient, RiskResult } from "@/lib/types";

type DecisionStatus = "추가 확인 필요" | "시군 검토 유지" | "병원-시군 인계" | "가족 안내 준비";

type CaseDecisionPanelProps = {
  patient: Patient;
  risk: RiskResult;
  candidates: CareResource[];
  candidateReviewState: Record<string, CandidateReviewStatus>;
  guideSafetyPass: boolean;
  onDecisionCommit?: (detail: string) => void;
};

export function CaseDecisionPanel({
  patient,
  risk,
  candidates,
  candidateReviewState,
  guideSafetyPass,
  onDecisionCommit
}: CaseDecisionPanelProps) {
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>("추가 확인 필요");
  const [note, setNote] = useState("72시간 내 전화 확인 후 식사·이동 공백과 가족 연락 가능 여부를 확인합니다.");
  const signal = assessCaseReview(patient, risk);
  const reviewedCount = Object.values(candidateReviewState).filter((status) => status !== "검토 대상").length;
  const activeCandidates = candidates.filter((candidate) => candidateReviewState[candidate.id] !== "제외");
  const suggestedActions = useMemo(() => getSuggestedActions(patient, risk, signal.reasons, activeCandidates), [
    patient,
    risk,
    signal.reasons,
    activeCandidates
  ]);
  const checks = [
    { label: "위험 점수와 상위 근거 확인", done: risk.reasons.length >= 3 },
    { label: "자원 후보 검토 상태 1건 이상 기록", done: reviewedCount > 0 },
    { label: "가족 안내문 운영 원칙 확인", done: guideSafetyPass },
    { label: "담당자 판단 메모 작성", done: note.trim().length >= 10 }
  ];
  const completionCount = checks.filter((item) => item.done).length;
  const handoffSummary = [
    `${patient.id} · ${regionLabels[patient.region]} · ${risk.band} ${risk.score}점`,
    `검토 상태: ${signal.windowStatus}, 퇴원 후 ${signal.elapsedHours}시간`,
    `핵심 사유: ${signal.reasons.slice(0, 3).join(", ")}`,
    `후보군: ${activeCandidates.slice(0, 2).map((item) => `${categoryLabels[item.category]} ${item.distanceKm.toFixed(1)}km`).join(" / ")}`,
    `판단: ${decisionStatus} · ${note.trim()}`
  ].join("\n");

  return (
    <section id="decision" className="scroll-mt-20 rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-teal" size={20} />
            <h2 className="text-lg font-bold text-ink">담당자 판단</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            위험 신호와 후보 정보를 확인한 뒤, 담당자가 남겨야 할 판단과 인계 요약을 정리합니다.
          </p>
        </div>
        <div className="rounded-md border border-line bg-panel px-3 py-2 text-sm">
          <p className="text-xs font-bold text-slate-500">완료 요건</p>
          <p className="font-black text-ink">{completionCount}/4</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-3">
          <div className="rounded-md border border-line bg-panel p-3">
            <div className="mb-2 flex items-center gap-2">
              <Send size={16} className="text-teal" />
              <h3 className="text-sm font-bold text-ink">권장 다음 행동</h3>
            </div>
            <ul className="grid gap-2 text-sm leading-6 text-slate-700">
              {suggestedActions.map((action) => (
                <li key={action} className="rounded-md bg-white px-3 py-2">
                  {action}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-line bg-panel p-3">
            <h3 className="text-sm font-bold text-ink">검토 완료 체크</h3>
            <div className="mt-3 grid gap-2">
              {checks.map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm">
                  <CheckCircle2 size={16} className={item.done ? "text-teal" : "text-slate-300"} />
                  <span className={item.done ? "font-semibold text-ink" : "text-slate-600"}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-line p-3">
          <div className="mb-3 flex items-center gap-2">
            <FileText size={16} className="text-teal" />
            <h3 className="text-sm font-bold text-ink">판단 기록</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <label className="grid gap-1 text-sm">
              <span className="font-bold text-slate-600">판단 상태</span>
              <select
                className="rounded border border-line bg-white px-2 py-2"
                value={decisionStatus}
                onChange={(event) => setDecisionStatus(event.target.value as DecisionStatus)}
              >
                <option>추가 확인 필요</option>
                <option>시군 검토 유지</option>
                <option>병원-시군 인계</option>
                <option>가족 안내 준비</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-bold text-slate-600">담당자 메모</span>
              <textarea
                className="min-h-24 rounded border border-line bg-white px-3 py-2 leading-6"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-3 rounded-md bg-panel p-3">
            <p className="mb-2 text-sm font-bold text-ink">인계 요약</p>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{handoffSummary}</pre>
          </div>

          <button
            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded border border-teal bg-teal px-3 py-2 text-sm font-bold text-white"
            type="button"
            onClick={() => onDecisionCommit?.(`${patient.id} ${decisionStatus}: ${note.trim()}`)}
          >
            <ClipboardCheck size={16} />
            판단 기록
          </button>
        </div>
      </div>
    </section>
  );
}

function getSuggestedActions(
  patient: Patient,
  risk: RiskResult,
  reasons: string[],
  activeCandidates: CareResource[]
) {
  const actions = [
    risk.band === "HIGH" ? "위험 근거 3개를 원자료와 대조하고 72시간 내 확인을 우선 배정" : "위험 근거를 확인하고 일반 퇴원 확인 흐름으로 유지",
    patient.caregiverPresent ? "상주 돌봄자에게 체크 항목 전달 가능 여부 확인" : "상주 돌봄자 부재로 식사·이동·연락 공백을 먼저 확인",
    activeCandidates.length > 0
      ? `${categoryLabels[activeCandidates[0].category]} 후보를 포함해 최소 2개 후보를 비교 검토`
      : "지역 후보 정보가 부족하므로 공공 창구 확인 필요"
  ];

  if (patient.preferredLanguage !== "ko") {
    actions.push("가족 안내문은 한국어와 외국어를 함께 검토한 뒤 전달");
  }

  if (reasons.includes("72시간 임박")) {
    actions.unshift("잔여 시간이 24시간 이하이므로 담당자 판단을 먼저 기록");
  }

  return actions.slice(0, 4);
}
