"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Building2,
  Camera,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Languages,
  ListChecks,
  PackageCheck,
  ShieldCheck,
  Timer,
  UserRoundCheck,
  Wand2
} from "lucide-react";
import { AuditLogPanel } from "./AuditLogPanel";
import { PatientInputForm } from "./PatientInputForm";
import { RiskResultCard } from "./RiskResultCard";
import { CareCandidateList } from "./CareCandidateList";
import { FamilyGuidePanel } from "./FamilyGuidePanel";
import { EvidenceCaptureView } from "./EvidenceCaptureView";
import { DemoFlow } from "./DemoFlow";
import { CaseDecisionPanel } from "./CaseDecisionPanel";
import { calculateRisk } from "@/lib/risk";
import { matchCareResources } from "@/lib/resources";
import { generateFamilyGuide } from "@/lib/guide";
import type {
  AuditLogEntry,
  CandidateReviewStatus,
  CareResource,
  Language,
  Patient
} from "@/lib/types";

type DemoDashboardProps = {
  initialPatients: Patient[];
  resources: CareResource[];
  captureMode: boolean;
};

export function DemoDashboard({ initialPatients, resources, captureMode }: DemoDashboardProps) {
  const initial = initialPatients.find((patient) => patient.id === "P003") ?? initialPatients[0];
  const [patient, setPatient] = useState<Patient>(initial);
  const [foreignLanguage, setForeignLanguage] = useState<Exclude<Language, "ko">>(
    initial.preferredLanguage === "vi" ? "vi" : "en"
  );
  const [candidateReviewState, setCandidateReviewState] = useState<Record<string, CandidateReviewStatus>>({});
  const [logs, setLogs] = useState<AuditLogEntry[]>([
    {
      id: "LOG-001",
      at: "09:00",
      actor: "시스템",
      action: "사례 불러오기",
      detail: "P003 사례 검토 화면을 로드했습니다."
    }
  ]);

  const risk = useMemo(() => calculateRisk(patient), [patient]);
  const resourceMatch = useMemo(() => matchCareResources(patient, resources), [patient, resources]);
  const koreanGuide = useMemo(
    () => generateFamilyGuide(patient, risk, resourceMatch.candidates, "ko"),
    [patient, risk, resourceMatch.candidates]
  );
  const foreignGuide = useMemo(
    () => generateFamilyGuide(patient, risk, resourceMatch.candidates, foreignLanguage),
    [patient, risk, resourceMatch.candidates, foreignLanguage]
  );

  return (
    <main className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 ${captureMode ? "max-w-[860px]" : "max-w-7xl"}`}>
      {!captureMode ? (
      <section className="mb-5 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="rounded-md bg-teal px-2.5 py-1 text-sm font-black text-white">CareBridge72</p>
              <span className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-bold text-slate-700">
                담당자용 퇴원 사례 검토 SaaS
              </span>
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-normal text-ink sm:text-4xl">
              퇴원 직후 돌봄 공백을 한 화면에서 검토합니다
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
              위험 신호, 지역 돌봄 후보, 가족 안내문, 판단 기록을 담당자 업무 순서대로 묶어 72시간 내 초기 확인을 빠르게 돕습니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
              <StatusPill icon={<Activity size={15} />} text="가명 데이터" />
              <StatusPill icon={<ClipboardCheck size={15} />} text="운영 원칙 확인" />
              <StatusPill icon={<UserRoundCheck size={15} />} text="담당자 보조" />
              <StatusPill icon={<ShieldCheck size={15} />} text="직접 연결 없음" />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <HeroValue icon={<Timer size={16} />} label="3분 검토" text="P003 사례 기준 즉시 시연" />
              <HeroValue icon={<FileText size={16} />} label="업무 산출물" text="인계 요약·가족 안내 초안" />
              <HeroValue icon={<Languages size={16} />} label="다국어 지원" text="ko/en/vi/zh 템플릿" />
            </div>
            <div className="mt-4 grid gap-2 rounded-md border border-line bg-panel p-3 text-sm text-slate-700 sm:grid-cols-3">
              <HeroMetric label="현재 사례" value={`${patient.id} · ${risk.band} ${risk.score}점`} />
              <HeroMetric label="후보 정보" value={`${resourceMatch.candidates.length}건 비교`} />
              <HeroMetric label="다음 행동" value={risk.band === "HIGH" ? "72시간 내 확인" : "일반 확인"} />
            </div>
          </div>

          <div className="grid gap-3 rounded-md border border-line bg-panel p-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-md bg-white p-3">
              <p className="text-xs font-black text-teal">업무 시작</p>
              <p className="mt-1 text-lg font-black text-ink">먼저 사례를 확인하세요</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                위험 신호와 후보 정보를 확인한 뒤, 필요할 때 AI 초안 화면으로 이동합니다.
              </p>
            </div>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:bg-panel"
              href="#case-review"
            >
              <ListChecks size={17} />
              사례 검토 시작
              <ChevronRight size={17} />
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-teal px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0b5f59]"
              href="/workspace"
            >
              <Wand2 size={17} />
              AI 초안 생성
              <ChevronRight size={17} />
            </a>
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-panel px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-white"
              href="/capture"
            >
              <Camera size={17} />
              별첨 캡처 화면
            </a>
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-panel"
              href="/readiness"
            >
              <PackageCheck size={17} />
              도입 검토
            </a>
          </div>
        </div>
        <CommercialFitStrip />
      </section>
      ) : null}

      {!captureMode ? <DemoFlow /> : null}

      {!captureMode ? (
        <div id="case-review" className="grid scroll-mt-20 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="self-start lg:sticky lg:top-16">
            <PatientInputForm
              patient={patient}
              patients={initialPatients}
              onChange={(nextPatient) => {
                setPatient(nextPatient);
                setCandidateReviewState({});
                appendLog("담당자 입력", `${nextPatient.id} 가명 사례 입력값을 갱신했습니다.`);
              }}
              onPrivacyBlocked={(detail) => appendLog("민감정보 차단", detail)}
              foreignLanguage={foreignLanguage}
              onForeignLanguageChange={setForeignLanguage}
            />
          </div>
          <section className="grid gap-5">
            <RiskResultCard risk={risk} patient={patient} />
            <CareCandidateList
              key={patient.id}
              candidates={resourceMatch.candidates}
              regionLabel={resourceMatch.candidates[0]?.regionLabel ?? ""}
              rationale={resourceMatch.rationale}
              onReviewChange={(candidate, status) => {
                setCandidateReviewState((current) => ({ ...current, [candidate.id]: status }));
                appendLog("후보 카드 검토", `${candidate.name}: ${status} 상태로 표시했습니다.`);
              }}
            />
            <FamilyGuidePanel
              koreanGuide={koreanGuide}
              foreignGuide={foreignGuide}
              onCopy={() => appendLog("안내문 복사", `${patient.id} 가족 안내문을 클립보드로 복사했습니다.`)}
            />
            <CaseDecisionPanel
              patient={patient}
              risk={risk}
              candidates={resourceMatch.candidates}
              candidateReviewState={candidateReviewState}
              guideSafetyPass={koreanGuide.safety.pass && foreignGuide.safety.pass}
              onDecisionCommit={(detail) => appendLog("담당자 판단", detail)}
            />
          </section>
        </div>
      ) : null}

      {captureMode ? (
        <EvidenceCaptureView
          patient={patient}
          risk={risk}
          candidates={resourceMatch.candidates}
          koreanGuide={koreanGuide}
          foreignGuide={foreignGuide}
          compact={false}
        />
      ) : null}

      {!captureMode ? <AuditLogPanel logs={logs} /> : null}
    </main>
  );

  function appendLog(action: string, detail: string) {
    setLogs((current) => {
      const entry: AuditLogEntry = {
        id: `LOG-${String(current.length + 1).padStart(3, "0")}`,
        at: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        actor: "시군 담당자",
        action,
        detail
      };
      return [entry, ...current].slice(0, 6);
    });
  }
}

function StatusPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex min-h-8 items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5">
      <span className="text-teal">{icon}</span>
      <span className="whitespace-nowrap font-medium">{text}</span>
    </div>
  );
}

function HeroValue({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div className="rounded-md border border-line bg-panel px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-black text-ink">
        <span className="text-teal">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white px-3 py-2">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-ink">{value}</p>
    </div>
  );
}

function CommercialFitStrip() {
  const items = [
    {
      icon: <Building2 size={17} />,
      label: "적용 대상",
      value: "시군 통합돌봄 · 병원 사회사업실"
    },
    {
      icon: <ClipboardCheck size={17} />,
      label: "입력",
      value: "가명 사례 · 생활환경 · 거주지역"
    },
    {
      icon: <FileText size={17} />,
      label: "출력",
      value: "위험 신호 · 후보 정보 · 안내 초안"
    },
    {
      icon: <ShieldCheck size={17} />,
      label: "운영 방식",
      value: "담당자 판단 보조 · 직접 연결 없음"
    }
  ];

  return (
    <div className="mt-5 grid gap-2 border-t border-line pt-4 md:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-md border border-line bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-teal">
            {item.icon}
            <p className="text-xs font-black text-slate-500">{item.label}</p>
          </div>
          <p className="text-sm font-bold leading-5 text-ink">{item.value}</p>
        </article>
      ))}
    </div>
  );
}
