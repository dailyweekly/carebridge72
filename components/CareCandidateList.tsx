"use client";

import { useState } from "react";
import { MapPin, Stethoscope } from "lucide-react";
import { CaptureCaption } from "./CaptureCaption";
import { categoryLabels } from "@/lib/labels";
import type { CandidateReviewStatus, CareResource } from "@/lib/types";

type CareCandidateListProps = {
  candidates: CareResource[];
  regionLabel: string;
  rationale: string;
  onReviewChange?: (candidate: CareResource, status: CandidateReviewStatus) => void;
  showScreenNote?: boolean;
};

export function CareCandidateList({
  candidates,
  regionLabel,
  rationale,
  onReviewChange,
  showScreenNote = false
}: CareCandidateListProps) {
  const [reviewState, setReviewState] = useState<Record<string, CandidateReviewStatus>>({});
  const [excludeReasons, setExcludeReasons] = useState<Record<string, string>>({});

  return (
    <section id="candidates" className="scroll-mt-20 rounded-md border border-line bg-white p-4 shadow-soft">
      {showScreenNote ? (
        <CaptureCaption
          title="화면 03 · 자원 후보"
          description="지역 코드와 카테고리 다양성 기준으로 후보군과 검토 상태를 표시합니다."
        />
      ) : null}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="text-teal" size={20} />
            <h2 className="text-lg font-bold text-ink">지역 돌봄 자원 후보 정보</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{rationale}</p>
        </div>
        <span className="rounded-md border border-line bg-panel px-3 py-1 text-sm font-semibold text-slate-700">
          {regionLabel} · {candidates.length}건
        </span>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <ReviewCriterion label="지역 일치" text="거주 시군 기준으로 후보를 좁힙니다." />
        <ReviewCriterion label="카테고리 다양성" text="방문·식사·이동 등 공백 유형을 나눠 봅니다." />
        <ReviewCriterion label="담당자 판단" text="후보는 비교 자료이며 직접 연결하지 않습니다." />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate) => {
          const status = reviewState[candidate.id] ?? "검토 대상";
          const statusTone =
            status === "제외"
              ? "border-slate-300 bg-slate-50"
              : status === "보류"
                ? "border-amber-300 bg-amber-50"
                : "border-line bg-white";
          return (
          <article key={candidate.id} className={`rounded-md border p-3 shadow-sm transition hover:shadow-soft ${statusTone}`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="inline-flex rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal">
                  {categoryLabels[candidate.category]}
                </p>
                <h3 className="mt-1 text-base font-bold text-ink">{candidate.name}</h3>
              </div>
              <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-bold text-slate-600">
                {status}
              </span>
            </div>
            <dl className="space-y-1 text-sm text-slate-700">
              <div className="flex justify-between gap-3">
                <dt className="font-semibold">가공 거리</dt>
                <dd>{candidate.distanceKm.toFixed(1)}km</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold">문의 창구</dt>
                <dd className="text-right">{candidate.publicContact}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold">운영</dt>
                <dd className="text-right">{candidate.operatingWindow}</dd>
              </div>
            </dl>
            <p className="mt-3 rounded-md bg-panel p-2 text-sm leading-5 text-slate-700">{candidate.notes}</p>
            <div className="mt-3 rounded-md border border-line bg-panel p-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Stethoscope size={14} className="text-teal" />
                담당자 검토 상태
              </label>
              <select
                className="mt-1 min-h-10 w-full rounded-md border border-line bg-white px-2 py-1.5 text-sm"
                value={status}
                onChange={(event) => {
                  const nextStatus = event.target.value as CandidateReviewStatus;
                  setReviewState((current) => ({ ...current, [candidate.id]: nextStatus }));
                  onReviewChange?.(candidate, nextStatus);
                }}
              >
                <option>검토 대상</option>
                <option>보류</option>
                <option>제외</option>
              </select>
              {status === "제외" ? (
                <input
                  className="mt-2 w-full rounded border border-line px-2 py-1.5 text-sm"
                  placeholder="제외 사유: 거리, 카테고리, 가족 선호 등"
                  value={excludeReasons[candidate.id] ?? ""}
                  onChange={(event) =>
                    setExcludeReasons((current) => ({ ...current, [candidate.id]: event.target.value }))
                  }
                />
              ) : null}
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

function ReviewCriterion({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-3">
      <p className="text-sm font-black text-ink">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}
