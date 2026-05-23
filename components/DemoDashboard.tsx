"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Activity, ClipboardCheck, ShieldCheck, UserRoundCheck } from "lucide-react";
import { AuditLogPanel } from "./AuditLogPanel";
import { PatientInputForm } from "./PatientInputForm";
import { RiskResultCard } from "./RiskResultCard";
import { CareCandidateList } from "./CareCandidateList";
import { FamilyGuidePanel } from "./FamilyGuidePanel";
import { EvidenceCaptureView } from "./EvidenceCaptureView";
import { DemoFlow } from "./DemoFlow";
import { SolutionOperations } from "./SolutionOperations";
import { CaseDecisionPanel } from "./CaseDecisionPanel";
import { calculateRisk } from "@/lib/risk";
import { matchCareResources } from "@/lib/resources";
import { generateFamilyGuide } from "@/lib/guide";
import type {
  AuditLogEntry,
  CandidateReviewStatus,
  CareResource,
  Language,
  Patient,
  PublicDataSource,
  ReviewCase
} from "@/lib/types";

type DemoDashboardProps = {
  initialPatients: Patient[];
  resources: CareResource[];
  sources: PublicDataSource[];
  cases: ReviewCase[];
  captureMode: boolean;
};

export function DemoDashboard({ initialPatients, resources, sources, cases, captureMode }: DemoDashboardProps) {
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
      <section className="mb-5 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-teal">CareBridge72</p>
          <h1 className="text-3xl font-bold tracking-normal text-ink">퇴원 후 72시간 사례 검토</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            담당자가 위험 신호, 지역 돌봄 자원 후보, 가족 안내문, 정책 지표를 한 곳에서 확인하는
            통합돌봄 업무 화면입니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
          <StatusPill icon={<Activity size={15} />} text="가명 데이터" />
          <StatusPill icon={<ClipboardCheck size={15} />} text="안전검사 통과" />
          <StatusPill icon={<UserRoundCheck size={15} />} text="담당자 화면" />
          <StatusPill icon={<ShieldCheck size={15} />} text="직접 연결 없음" />
          {!captureMode ? <StatusLink href="/capture" text="캡처 화면" /> : null}
        </div>
      </section>
      ) : null}

      {!captureMode ? <DemoFlow /> : null}

      {!captureMode ? (
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
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

      {!captureMode ? (
        <SolutionOperations
          patients={initialPatients}
          resources={resources}
          cases={cases}
          sources={sources}
          activePatient={patient}
          activeRisk={risk}
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

function StatusLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      className="flex min-h-9 items-center justify-center rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm"
      href={href}
    >
      {text}
    </a>
  );
}

function StatusPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex min-h-9 items-center gap-2 rounded-md border border-line bg-white px-3 py-2 shadow-sm">
      <span className="text-teal">{icon}</span>
      <span className="whitespace-nowrap font-medium">{text}</span>
    </div>
  );
}
