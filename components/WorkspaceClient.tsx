"use client";

import { ArrowRight, Bot, CheckCircle2, ClipboardCheck, Copy, FileText, Languages, Loader2, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CareCandidateList } from "./CareCandidateList";
import { PatientInputForm } from "./PatientInputForm";
import { RiskResultCard } from "./RiskResultCard";
import { assessCaseReview } from "@/lib/case-review";
import { calculateRisk } from "@/lib/risk";
import { matchCareResources } from "@/lib/resources";
import { generateFamilyGuide } from "@/lib/guide";
import type { CareResource, Language, Patient } from "@/lib/types";
import type { DraftKind, DraftResponse } from "@/lib/llm-draft";

type WorkspaceClientProps = {
  initialPatients: Patient[];
  resources: CareResource[];
};

type DraftState = Record<DraftKind, DraftResponse | null>;

export function WorkspaceClient({ initialPatients, resources }: WorkspaceClientProps) {
  const initial = initialPatients.find((patient) => patient.id === "P003") ?? initialPatients[0];
  const [patient, setPatient] = useState<Patient>(initial);
  const [foreignLanguage, setForeignLanguage] = useState<Exclude<Language, "ko">>("en");
  const [memo, setMemo] = useState("72시간 내 전화 확인 후 식사·이동 공백과 가족 연락 가능 여부를 확인합니다.");
  const [pendingKind, setPendingKind] = useState<DraftKind | null>(null);
  const [drafts, setDrafts] = useState<DraftState>({ handoff: null, family: null });
  const [error, setError] = useState("");

  const risk = useMemo(() => calculateRisk(patient), [patient]);
  const resourceMatch = useMemo(() => matchCareResources(patient, resources), [patient, resources]);
  const guide = useMemo(
    () => generateFamilyGuide(patient, risk, resourceMatch.candidates, foreignLanguage),
    [foreignLanguage, patient, resourceMatch.candidates, risk]
  );
  const signal = useMemo(() => assessCaseReview(patient, risk), [patient, risk]);
  const activeDraftCount = Number(Boolean(drafts.handoff)) + Number(Boolean(drafts.family));

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-5 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-bold text-teal">CareBridge72 Workspace</p>
            <h1 className="text-3xl font-black tracking-normal text-ink sm:text-4xl">담당자 인계와 가족 안내 초안</h1>
            <p className="mt-3 text-base leading-7 text-slate-700">
              선택된 사례의 위험 신호와 지역 후보를 확인한 뒤, Claude가 담당자용 문서 초안을 작성합니다.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:w-[380px]">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b5f59] disabled:opacity-60"
              type="button"
              disabled={Boolean(pendingKind)}
              onClick={() => requestDraft("handoff")}
            >
              {pendingKind === "handoff" ? <Loader2 size={17} className="animate-spin" /> : <FileText size={17} />}
              인계 요약 생성
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-teal bg-white px-4 py-3 text-sm font-black text-teal shadow-sm transition hover:bg-panel disabled:opacity-60"
              type="button"
              disabled={Boolean(pendingKind)}
              onClick={() => requestDraft("family")}
            >
              {pendingKind === "family" ? <Loader2 size={17} className="animate-spin" /> : <Languages size={17} />}
              가족 안내 초안
            </button>
            <a
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm font-bold text-slate-700 sm:col-span-2"
              href="/demo"
            >
              전체 데모 화면
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SummaryTile label="선택 사례" value={`${patient.id} · ${risk.band} ${risk.score}점`} tone={risk.band === "HIGH" ? "risk" : "default"} />
          <SummaryTile label="검토 시간" value={`${signal.windowStatus} · ${signal.elapsedHours}h`} />
          <SummaryTile label="지역 후보" value={`${resourceMatch.candidates.length}건`} />
          <SummaryTile label="초안 상태" value={`${activeDraftCount}/2 생성`} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="grid gap-4 self-start lg:sticky lg:top-4">
          <WorkspaceSteps
            hasHandoff={Boolean(drafts.handoff)}
            hasFamily={Boolean(drafts.family)}
            candidateCount={resourceMatch.candidates.length}
          />
          <div id="case-input">
            <PatientInputForm
              patient={patient}
              patients={initialPatients}
              onChange={(nextPatient) => {
                setPatient(nextPatient);
                setDrafts({ handoff: null, family: null });
              }}
              onPrivacyBlocked={setError}
              foreignLanguage={foreignLanguage}
              onForeignLanguageChange={setForeignLanguage}
            />
          </div>
        </aside>

        <section className="grid gap-5">
          <section className="rounded-md border border-line bg-white p-4 shadow-soft">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Bot className="text-teal" size={20} />
                  <h2 className="text-lg font-bold text-ink">LLM 적용 범위</h2>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  LLM은 점수 산정, 기관 지정, 의료 판단을 하지 않습니다. 담당자 확인 후 사용할 문서 초안만 생성합니다.
                </p>
              </div>
              <span className="rounded-md border border-line bg-panel px-3 py-1 text-xs font-bold text-slate-700">
                {signal.windowStatus} · 퇴원 후 {signal.elapsedHours}h
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <ScopeCard icon={<ClipboardCheck size={17} />} title="위험 판단" text="기존 규칙·모델 결과만 사용" />
              <ScopeCard icon={<FileText size={17} />} title="인계 요약" text="LLM 초안 생성 가능" />
              <ScopeCard icon={<Languages size={17} />} title="가족 안내" text="운영 원칙 확인 후 표시" />
            </div>
          </section>

          <div id="risk-review">
            <RiskResultCard risk={risk} patient={patient} />
          </div>
          <div id="resource-review">
            <CareCandidateList
              candidates={resourceMatch.candidates}
              regionLabel={resourceMatch.candidates[0]?.regionLabel ?? ""}
              rationale={resourceMatch.rationale}
            />
          </div>

          <section id="draft-work" className="rounded-md border border-line bg-white p-4 shadow-soft">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 className="text-teal" size={20} />
                  <h2 className="text-lg font-bold text-ink">담당자 메모와 AI 초안</h2>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  메모는 초안의 맥락으로만 사용되며, 주민번호·연락처·상세주소는 반영하지 않습니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <DraftButton kind="handoff" pendingKind={pendingKind} onClick={requestDraft} />
                <DraftButton kind="family" pendingKind={pendingKind} onClick={requestDraft} />
              </div>
            </div>

            <label className="mb-3 grid gap-1 text-sm">
              <span className="font-bold text-slate-600">담당자 메모</span>
              <textarea
                className="min-h-20 rounded border border-line bg-white px-3 py-2 leading-6"
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
              />
            </label>

            {error ? <p className="mb-3 rounded-md bg-rose-50 p-2 text-sm font-semibold text-cranberry">{error}</p> : null}

            <div className="grid gap-3 lg:grid-cols-2">
              <DraftCard
                title="담당자 인계 요약"
                draft={drafts.handoff}
                emptyText="위험 신호와 후보 정보를 확인한 뒤 인계 요약 초안을 생성합니다."
              />
              <DraftCard title="가족 안내문 초안" draft={drafts.family} fallbackText={guide.text} />
            </div>
          </section>
        </section>
      </div>
    </main>
  );

  async function requestDraft(kind: DraftKind) {
    setPendingKind(kind);
    setError("");
    try {
      const response = await fetch("/api/llm/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          patient,
          risk,
          candidates: resourceMatch.candidates,
          guide,
          memo
        })
      });
      if (!response.ok) throw new Error(`draft request failed: ${response.status}`);
      const draft = (await response.json()) as DraftResponse;
      setDrafts((current) => ({ ...current, [kind]: draft }));
    } catch {
      setError("AI 초안 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setPendingKind(null);
    }
  }
}

function ScopeCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-md border border-line bg-panel p-3">
      <div className="mb-2 text-teal">{icon}</div>
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
    </article>
  );
}

function SummaryTile({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "risk" }) {
  return (
    <div className={`rounded-md border px-3 py-3 ${tone === "risk" ? "border-cranberry bg-rose-50" : "border-line bg-panel"}`}>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${tone === "risk" ? "text-cranberry" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function WorkspaceSteps({
  hasHandoff,
  hasFamily,
  candidateCount
}: {
  hasHandoff: boolean;
  hasFamily: boolean;
  candidateCount: number;
}) {
  const steps = [
    { href: "#case-input", title: "사례 확인", done: true },
    { href: "#risk-review", title: "위험 신호", done: true },
    { href: "#resource-review", title: "후보 검토", done: candidateCount > 0 },
    { href: "#draft-work", title: "초안 생성", done: hasHandoff || hasFamily }
  ];
  return (
    <nav className="rounded-md border border-line bg-white p-3 shadow-soft" aria-label="작업 진행">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-ink">작업 진행</p>
        <span className="rounded bg-panel px-2 py-1 text-xs font-bold text-slate-600">
          {Number(hasHandoff) + Number(hasFamily)}/2 초안
        </span>
      </div>
      <div className="grid gap-2">
        {steps.map((step, index) => (
          <a
            key={step.href}
            className="flex min-h-10 items-center gap-3 rounded-md border border-line bg-panel px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-white"
            href={step.href}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                step.done ? "bg-teal text-white" : "bg-white text-slate-500"
              }`}
            >
              {step.done ? <CheckCircle2 size={15} /> : index + 1}
            </span>
            {step.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

function DraftButton({
  kind,
  pendingKind,
  onClick
}: {
  kind: DraftKind;
  pendingKind: DraftKind | null;
  onClick: (kind: DraftKind) => void;
}) {
  const label = kind === "handoff" ? "인계 요약 생성" : "가족 안내 초안";
  const pending = pendingKind === kind;
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-teal bg-teal px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
      type="button"
      disabled={Boolean(pendingKind)}
      onClick={() => onClick(kind)}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
      {label}
    </button>
  );
}

function DraftCard({
  title,
  draft,
  fallbackText,
  emptyText
}: {
  title: string;
  draft: DraftResponse | null;
  fallbackText?: string;
  emptyText?: string;
}) {
  const text = draft?.text ?? fallbackText ?? emptyText ?? "아직 생성된 초안이 없습니다.";
  const canCopy = Boolean(draft?.text || fallbackText);
  return (
    <article className="rounded-md border border-line bg-panel p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-bold text-ink">{title}</h3>
        <div className="flex items-center gap-2">
          {draft ? (
            <span className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-700">
              {draft.source === "claude" ? "Claude 생성" : "예비 초안"} · {draft.safetyPass ? "통과" : "검토 필요"}
            </span>
          ) : null}
          {canCopy ? (
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-line bg-white text-slate-600"
              type="button"
              aria-label={`${title} 복사`}
              onClick={() => void navigator.clipboard?.writeText(text)}
            >
              <Copy size={15} />
            </button>
          ) : null}
        </div>
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{text}</p>
      {draft ? <p className="mt-3 text-xs text-slate-500">model: {draft.model}</p> : null}
    </article>
  );
}
