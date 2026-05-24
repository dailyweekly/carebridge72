"use client";

import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Database,
  DatabaseZap,
  FileText,
  Languages,
  Loader2,
  LockKeyhole,
  WifiOff,
  Wand2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CareCandidateList } from "./CareCandidateList";
import { PatientInputForm } from "./PatientInputForm";
import { RiskResultCard } from "./RiskResultCard";
import { assessCaseReview } from "@/lib/case-review";
import { calculateRisk } from "@/lib/risk";
import { matchCareResources } from "@/lib/resources";
import { generateFamilyGuide } from "@/lib/guide";
import type { HospitalReference } from "@/lib/hira-hospital";
import type { CareResource, Language, Patient, ResourceMatch } from "@/lib/types";
import type { IntegrationStatus } from "@/lib/data-integrations";
import type { DraftKind, DraftResponse } from "@/lib/llm-draft";

type WorkspaceClientProps = {
  initialPatients: Patient[];
  resources: CareResource[];
};

type DraftState = Record<DraftKind, DraftResponse | null>;
type ResourceStatus = "loading" | "live" | "fallback";
type HospitalStatus = "loading" | "live" | "empty";
type IntegrationSummary = {
  generatedAt: string;
  integrations: IntegrationStatus[];
};
const workspaceAccessCode = "7272";

export function WorkspaceClient({ initialPatients, resources }: WorkspaceClientProps) {
  const initial = initialPatients.find((patient) => patient.id === "P003") ?? initialPatients[0];
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [patient, setPatient] = useState<Patient>(initial);
  const [foreignLanguage, setForeignLanguage] = useState<Exclude<Language, "ko">>("en");
  const [memo, setMemo] = useState("72시간 내 전화 확인 후 식사·이동 공백과 가족 연락 가능 여부를 확인합니다.");
  const [pendingKind, setPendingKind] = useState<DraftKind | null>(null);
  const [drafts, setDrafts] = useState<DraftState>({ handoff: null, family: null });
  const [liveResourceMatch, setLiveResourceMatch] = useState<(ResourceMatch & { patientId: string }) | null>(null);
  const [resourceStatus, setResourceStatus] = useState<ResourceStatus>("loading");
  const [hospitalReferences, setHospitalReferences] = useState<HospitalReference[]>([]);
  const [hospitalStatus, setHospitalStatus] = useState<HospitalStatus>("loading");
  const [integrationSummary, setIntegrationSummary] = useState<IntegrationSummary | null>(null);
  const [error, setError] = useState("");

  const risk = useMemo(() => calculateRisk(patient), [patient]);
  const fallbackResourceMatch = useMemo<ResourceMatch>(
    () => ({ ...matchCareResources(patient, resources), source: "mock" }),
    [patient, resources]
  );
  const resourceMatch =
    liveResourceMatch?.patientId === patient.id ? liveResourceMatch : fallbackResourceMatch;
  const resourceSourceLabel =
    resourceStatus === "loading"
      ? "공공데이터 조회 중"
      : resourceMatch.source === "nhis-live-with-mock-fallback"
        ? "NHIS 실시간 + mock 보강"
        : "mock 후보";
  const guide = useMemo(
    () => generateFamilyGuide(patient, risk, resourceMatch.candidates, foreignLanguage),
    [foreignLanguage, patient, resourceMatch.candidates, risk]
  );
  const signal = useMemo(() => assessCaseReview(patient, risk), [patient, risk]);
  const activeDraftCount = Number(Boolean(drafts.handoff)) + Number(Boolean(drafts.family));

  useEffect(() => {
    if (!accessGranted) return;

    let cancelled = false;
    const patientSnapshot = patient;

    async function loadLiveResources() {
      try {
        const response = await fetch("/api/resources", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ patient: patientSnapshot })
        });
        if (!response.ok) throw new Error(`resources request failed: ${response.status}`);
        const result = (await response.json()) as ResourceMatch;
        if (cancelled) return;
        setLiveResourceMatch({ ...result, patientId: patientSnapshot.id });
        setResourceStatus(result.source === "nhis-live-with-mock-fallback" ? "live" : "fallback");
      } catch {
        if (cancelled) return;
        setLiveResourceMatch(null);
        setResourceStatus("fallback");
      }
    }

    void loadLiveResources();

    return () => {
      cancelled = true;
    };
  }, [accessGranted, patient]);

  useEffect(() => {
    if (!accessGranted) return;

    let cancelled = false;
    const patientSnapshot = patient;

    async function loadHospitalReferences() {
      try {
        const response = await fetch("/api/hospitals", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ patient: patientSnapshot })
        });
        if (!response.ok) throw new Error(`hospitals request failed: ${response.status}`);
        const result = (await response.json()) as { source: "hira-live" | "empty"; references: HospitalReference[] };
        if (cancelled) return;
        setHospitalReferences(result.references);
        setHospitalStatus(result.source === "hira-live" ? "live" : "empty");
      } catch {
        if (cancelled) return;
        setHospitalReferences([]);
        setHospitalStatus("empty");
      }
    }

    void loadHospitalReferences();

    return () => {
      cancelled = true;
    };
  }, [accessGranted, patient]);

  useEffect(() => {
    if (!accessGranted) return;

    let cancelled = false;

    async function loadIntegrationSummary() {
      try {
        const response = await fetch("/api/integrations/status");
        if (!response.ok) throw new Error(`integrations request failed: ${response.status}`);
        const result = (await response.json()) as IntegrationSummary;
        if (!cancelled) setIntegrationSummary(result);
      } catch {
        if (!cancelled) setIntegrationSummary(null);
      }
    }

    void loadIntegrationSummary();

    return () => {
      cancelled = true;
    };
  }, [accessGranted]);

  if (!accessGranted) {
    return (
      <main className="mx-auto flex min-h-[72vh] max-w-3xl items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-md border border-line bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal text-white">
              <LockKeyhole size={22} />
            </span>
            <div>
              <p className="text-sm font-bold text-teal">CareBridge72 Workspace</p>
              <h1 className="mt-1 text-2xl font-black text-ink">AI 작업 화면 접근 코드</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Claude API 토큰이 사용될 수 있는 화면입니다. 접근 코드를 입력하면 담당자 인계와 가족 안내 초안 화면으로 이동합니다.
              </p>
            </div>
          </div>

          <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]" onSubmit={submitAccessCode}>
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-600">접근 코드</span>
              <input
                className="min-h-11 rounded-md border border-line px-3 py-2 text-lg font-bold tracking-normal"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={accessCode}
                onChange={(event) => {
                  setAccessCode(event.target.value);
                  setAccessError("");
                }}
              />
            </label>
            <button
              className="mt-auto inline-flex min-h-11 items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-black text-white"
              type="submit"
            >
              입장
            </button>
          </form>
          {accessError ? <p className="mt-3 text-sm font-bold text-cranberry">{accessError}</p> : null}
          <p className="mt-4 text-xs leading-5 text-slate-500">
            데모 화면은 공개되어 있으며, 실제 초안 생성은 접근 코드 확인 후 사용할 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

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

        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <SummaryTile label="선택 사례" value={`${patient.id} · ${risk.band} ${risk.score}점`} tone={risk.band === "HIGH" ? "risk" : "default"} />
          <SummaryTile label="검토 시간" value={`${signal.windowStatus} · ${signal.elapsedHours}h`} />
          <SummaryTile label="지역 후보" value={`${resourceMatch.candidates.length}건`} hint={resourceSourceLabel} />
          <SummaryTile label="병원 기준정보" value={hospitalStatus === "loading" ? "조회 중" : `${hospitalReferences.length}건`} hint={hospitalStatus === "live" ? "HIRA live" : "기준정보 없음"} />
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
                setLiveResourceMatch(null);
                setResourceStatus("loading");
                setHospitalReferences([]);
                setHospitalStatus("loading");
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
            <ResourceSourceNotice status={resourceStatus} source={resourceMatch.source} />
            <CareCandidateList
              candidates={resourceMatch.candidates}
              regionLabel={resourceMatch.candidates[0]?.regionLabel ?? ""}
              rationale={resourceMatch.rationale}
            />
          </div>
          <HospitalReferencePanel status={hospitalStatus} references={hospitalReferences} />
          <IntegrationStatusPanel summary={integrationSummary} />

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
        headers: {
          "content-type": "application/json",
          "x-carebridge-access-code": accessCode
        },
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

  function submitAccessCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (accessCode.trim() !== workspaceAccessCode) {
      setAccessError("접근 코드가 올바르지 않습니다.");
      return;
    }
    setAccessGranted(true);
  }
}

function HospitalReferencePanel({ status, references }: { status: HospitalStatus; references: HospitalReference[] }) {
  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-teal" size={20} />
            <h2 className="text-lg font-bold text-ink">병원 사회사업실 기준정보</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            HIRA 병원정보서비스를 조회해 병원 내 담당자가 확인할 수 있는 지역 기준정보만 표시합니다.
          </p>
        </div>
        <span className="rounded-md border border-line bg-panel px-3 py-1 text-sm font-semibold text-slate-700">
          {status === "loading" ? "조회 중" : status === "live" ? `HIRA live · ${references.length}건` : "표시할 기준정보 없음"}
        </span>
      </div>

      {references.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {references.slice(0, 4).map((reference) => (
            <article key={reference.id} className="rounded-md border border-line bg-panel p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-teal">{reference.className}</p>
                  <h3 className="mt-1 font-bold text-ink">{reference.name}</h3>
                </div>
                <span className="shrink-0 rounded bg-white px-2 py-1 text-xs font-bold text-slate-600">
                  {reference.district}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-700">{reference.addressSummary}</p>
              <p className="mt-2 rounded bg-white p-2 text-xs leading-5 text-slate-600">{reference.useLimit}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-line bg-panel p-4 text-sm leading-6 text-slate-600">
          {status === "loading"
            ? "외부 병원정보서비스 응답을 기다리고 있습니다."
            : "외부 API 지연 또는 지역 결과 없음으로 기준정보를 표시하지 않습니다. 돌봄 후보 검토와 AI 초안 생성은 계속 진행할 수 있습니다."}
        </div>
      )}
    </section>
  );
}

function IntegrationStatusPanel({ summary }: { summary: IntegrationSummary | null }) {
  const visibleIntegrations = summary?.integrations.filter((item) => item.priority !== "P3").slice(0, 5) ?? [];
  const configuredCount = visibleIntegrations.filter((item) => item.stage === "configured").length;

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database className="text-teal" size={20} />
            <h2 className="text-lg font-bold text-ink">실데이터 연동 상태</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            운영 환경변수 구성 여부만 표시하며 키 값은 화면이나 API 응답에 노출하지 않습니다.
          </p>
        </div>
        <span className="rounded-md border border-line bg-panel px-3 py-1 text-sm font-semibold text-slate-700">
          {summary ? `${configuredCount}/${visibleIntegrations.length} 구성` : "상태 확인 중"}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {visibleIntegrations.map((item) => (
          <article key={item.id} className="rounded-md border border-line bg-panel p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="font-bold text-ink">{item.name}</p>
              <span className={`shrink-0 rounded px-2 py-1 text-xs font-black ${item.stage === "configured" ? "bg-teal text-white" : "bg-white text-slate-600"}`}>
                {item.stage === "configured" ? "구성됨" : "대기"}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{item.provider}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.purpose}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              확인 항목: {item.configuredKeys.length > 0 ? item.configuredKeys.join(", ") : item.missingKeys.join(", ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResourceSourceNotice({ status, source }: { status: ResourceStatus; source?: ResourceMatch["source"] }) {
  const isLive = source === "nhis-live-with-mock-fallback" && status === "live";
  return (
    <div className="mb-3 rounded-md border border-line bg-white p-3 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-teal">
            {isLive ? <DatabaseZap size={18} /> : status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <WifiOff size={18} />}
          </span>
          <div>
            <p className="text-sm font-black text-ink">
              {isLive ? "공공데이터 실시간 후보 반영" : status === "loading" ? "공공데이터 후보 조회 중" : "예비 후보 데이터로 표시"}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {isLive
                ? "국민건강보험공단 장기요양기관 검색 서비스 결과를 우선 반영하고, 부족한 카테고리는 mock 후보로 보강합니다."
                : "외부 API 지연 또는 미응답 시 화면 흐름을 유지하기 위해 예비 후보를 표시합니다."}
            </p>
          </div>
        </div>
        <span className="rounded-md border border-line bg-panel px-2 py-1 text-xs font-bold text-slate-700">
          {isLive ? "NHIS live" : status === "loading" ? "loading" : "mock fallback"}
        </span>
      </div>
    </div>
  );
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

function SummaryTile({
  label,
  value,
  hint,
  tone = "default"
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "risk";
}) {
  return (
    <div className={`rounded-md border px-3 py-3 ${tone === "risk" ? "border-cranberry bg-rose-50" : "border-line bg-panel"}`}>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${tone === "risk" ? "text-cranberry" : "text-ink"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p> : null}
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
