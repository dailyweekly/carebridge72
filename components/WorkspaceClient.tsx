"use client";

import { Bot, ClipboardCheck, FileText, Languages, Loader2, Wand2 } from "lucide-react";
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-5 flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-teal">CareBridge72 Workspace</p>
          <h1 className="text-3xl font-bold tracking-normal text-ink">AI 문서화 보조 작업 화면</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            위험 판단과 후보 매칭은 검증 가능한 규칙·데이터로 처리하고, LLM은 담당자 인계 요약과 가족 안내문 초안 작성에만 사용합니다.
          </p>
        </div>
        <a
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm"
          href="/demo"
        >
          데모 화면
        </a>
      </section>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
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

          <RiskResultCard risk={risk} patient={patient} />
          <CareCandidateList
            candidates={resourceMatch.candidates}
            regionLabel={resourceMatch.candidates[0]?.regionLabel ?? ""}
            rationale={resourceMatch.rationale}
          />

          <section className="rounded-md border border-line bg-white p-4 shadow-soft">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 className="text-teal" size={20} />
                  <h2 className="text-lg font-bold text-ink">AI 초안 생성</h2>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  OpenAI API 키가 없으면 동일 입력 기반의 예비 초안이 생성됩니다. API 키가 있으면 서버 route에서 Responses API를 호출합니다.
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
              <DraftCard title="담당자 인계 요약" draft={drafts.handoff} />
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
  fallbackText
}: {
  title: string;
  draft: DraftResponse | null;
  fallbackText?: string;
}) {
  const text = draft?.text ?? fallbackText ?? "아직 생성된 초안이 없습니다.";
  return (
    <article className="rounded-md border border-line bg-panel p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-bold text-ink">{title}</h3>
        {draft ? (
          <span className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-700">
            {draft.source === "openai" ? "LLM 생성" : "예비 초안"} · {draft.safetyPass ? "통과" : "검토 필요"}
          </span>
        ) : null}
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{text}</p>
      {draft ? <p className="mt-3 text-xs text-slate-500">model: {draft.model}</p> : null}
    </article>
  );
}
