import { Building2, Database, FileCheck2, GitBranch, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { bandLabels, diagnosisLabels, regionLabels } from "@/lib/labels";
import { assessCaseReview, sortCasesByReviewPriority } from "@/lib/case-review";
import { dataIntegrations } from "@/lib/data-integrations";
import { calculateRisk } from "@/lib/risk";
import type { CareResource, Patient, PublicDataSource, ReviewCase, RiskResult } from "@/lib/types";

type SolutionOperationsProps = {
  patients: Patient[];
  resources: CareResource[];
  cases: ReviewCase[];
  sources: PublicDataSource[];
  activePatient: Patient;
  activeRisk: RiskResult;
};

export function SolutionOperations({
  patients,
  resources,
  cases,
  sources,
  activePatient,
  activeRisk
}: SolutionOperationsProps) {
  return (
    <section className="mt-6 grid gap-5">
      <CaseQueuePanel patients={patients} cases={cases} />
      <RoleModePanel />
      <DataIntegrationPanel />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ModelGovernancePanel sources={sources} activeRisk={activeRisk} />
        <SafetyZonePanel />
      </div>
      <ModelCardPanel activeRisk={activeRisk} />
      <PolicyAnalyticsPanel patients={patients} resources={resources} cases={cases} activePatient={activePatient} />
    </section>
  );
}

function DataIntegrationPanel() {
  const topItems = dataIntegrations.filter((item) => item.priority !== "P3");
  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database size={20} className="text-teal" />
            <h2 className="text-lg font-bold text-ink">실데이터 연동 준비</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            공개 API는 서비스키 확보 즉시 연결하고, HIRA CDM은 보안 분석 환경에서 별도 학습 파이프라인으로 처리합니다.
          </p>
        </div>
        <a
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-panel px-3 py-2 text-sm font-bold text-slate-700"
          href="/api/integrations/status"
        >
          연동 상태 JSON
        </a>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {topItems.map((item) => (
          <article key={item.id} className="rounded-md border border-line bg-panel p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="font-bold text-ink">{item.name}</p>
              <span className="rounded bg-white px-2 py-0.5 text-xs font-black text-teal">{item.priority}</span>
            </div>
            <p className="text-xs font-bold text-slate-500">{item.provider}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.purpose}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              필요 키: {item.envKeys.length > 0 ? item.envKeys.join(", ") : "보안 분석 환경 내 신청"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoleModePanel() {
  const modes = [
    ["시군 통합돌봄", "B2G 라이선스", "72시간 내 사례 검토, 후보 정보 확인, 가족 안내문 전달"],
    ["병원 사회사업실", "B2B PoC", "퇴원계획 수립 시 거주지 기반 자원 후보와 공공 창구 확인"],
    ["광역 정책 분석", "B2G 분석 모듈", "시군별 HIGH 비율, 다국어 안내 비율, 자원 공백을 분기 리포트로 확인"]
  ];

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Building2 size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">역할 기반 사용 모드</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {modes.map(([mode, channel, copy]) => (
          <article key={mode} className="rounded-md border border-line bg-panel p-3">
            <p className="text-xs font-bold text-teal">{channel}</p>
            <h3 className="mt-1 font-bold text-ink">{mode}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ModelCardPanel({ activeRisk }: Pick<SolutionOperationsProps, "activeRisk">) {
  const topFactors = [...activeRisk.factors]
    .filter((factor) => factor.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  const mappings = [
    ["위험분류", "HIRA 공개 통계 + K-OMOP 정식 신청 예정", "점수·밴드·근거 3개"],
    ["후보 정보", "통합돌봄 조직 DB + 장기요양 인프라 + 지자체 시설 데이터", "복수 후보 카드"],
    ["가족 안내", "공공 안내문 원문 + 행정 용어 표준 번역 사전", "한국어+외국어 병기"]
  ];

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">AI 설명력·데이터 매핑</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded border border-line bg-panel p-3">
          <p className="font-bold text-ink">왜 HIGH인가</p>
          <div className="mt-3 grid gap-2">
            {topFactors.map((factor) => (
              <div key={`${factor.axis}-${factor.label}`} className="flex justify-between rounded bg-white px-3 py-2 text-sm">
                <span>{factor.label}</span>
                <span className="font-black text-cranberry">+{factor.points}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            다음 담당자 확인 질문: 퇴원 후 72시간 내 연락 가능성, 식사·이동 공백, 외래 방문 동행 가능 여부.
          </p>
        </div>
        <div className="rounded border border-line bg-panel p-3">
          <p className="font-bold text-ink">모델 출력별 데이터 출처 연결</p>
          <div className="mt-3 grid gap-2">
            {mappings.map(([model, source, output]) => (
              <div key={model} className="grid gap-1 rounded bg-white p-3 text-sm md:grid-cols-[100px_minmax(0,1fr)_140px]">
                <span className="font-bold text-teal">{model}</span>
                <span className="text-slate-700">{source}</span>
                <span className="font-semibold text-slate-700">{output}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded bg-white p-3 text-sm leading-6 text-slate-700">
            안내문 생성 통제: 템플릿 선택 → 표준 용어 치환 → 출처·갱신일 부착 → 정규식 8개 검사 → 통과 시 표시.
          </div>
        </div>
      </div>
    </section>
  );
}

function CaseQueuePanel({ patients, cases }: Pick<SolutionOperationsProps, "patients" | "cases">) {
  const sortedCases = sortCasesByReviewPriority(cases, patients, calculateRisk);

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound size={20} className="text-teal" />
            <h2 className="text-lg font-bold text-ink">담당자 업무 대기열</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            퇴원 후 72시간 창, 위험 신호, 돌봄 공백, 언어 지원 필요성을 합산해 우선순위를 정렬합니다.
          </p>
        </div>
        <span className="rounded-md border border-line bg-panel px-3 py-2 text-xs font-bold text-slate-700">
          우선순위 자동 정렬
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-5">
        {sortedCases.map((item) => {
          const patient = patients.find((entry) => entry.id === item.patientId);
          const risk = calculateRisk(patient);
          const signal = patient ? assessCaseReview(patient, risk, item) : null;
          return (
            <article key={item.id} className="rounded-md border border-line p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-teal">{item.id}</p>
                  <h3 className="font-bold text-ink">{item.patientId}</h3>
                </div>
                <span className={risk.band === "HIGH" ? "text-sm font-black text-cranberry" : "text-sm font-bold text-teal"}>
                  {bandLabels[risk.band]}
                </span>
              </div>
              <p className="text-sm text-slate-700">
                {patient ? `${regionLabels[patient.region]} · ${diagnosisLabels[patient.primaryDiagnosisGroup]}` : "가명 정보 없음"}
              </p>
              <div className="mt-3 grid gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className={getWindowBadgeClass(signal?.windowStatus)}>
                    {signal?.windowStatus ?? item.stage}
                  </span>
                  <span className="rounded bg-panel px-2 py-1 text-xs font-semibold text-slate-700">{item.stage}</span>
                </div>
                <p className="text-xs leading-5 text-slate-600">
                  {signal
                    ? `퇴원 후 ${signal.elapsedHours}h · ${formatRemainingHours(signal.remainingHours)}`
                    : `D-${item.dueHours}h`}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(signal?.reasons ?? []).slice(0, 3).map((reason) => (
                    <span key={reason} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {item.owner} · {item.channel} · 우선순위 {signal?.priorityScore ?? "-"}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getWindowBadgeClass(status?: string) {
  const base = "rounded px-2 py-1 text-xs font-bold";
  if (status === "검토 필요") return `${base} bg-cranberry/10 text-cranberry`;
  if (status === "일반 확인") return `${base} bg-teal/10 text-teal`;
  if (status === "72시간 초과") return `${base} bg-slate-200 text-slate-700`;
  return `${base} bg-panel text-slate-700`;
}

function formatRemainingHours(hours: number) {
  if (hours < 0) return `72시간 초과 ${Math.abs(hours)}h`;
  return `잔여 ${hours}h`;
}

function ModelGovernancePanel({
  sources,
  activeRisk
}: Pick<SolutionOperationsProps, "sources" | "activeRisk">) {
  const models = [
    {
      name: "① 재입원 위험분류",
      method: "경량 분류 모델 + 해석 가능 규칙",
      output: `${activeRisk.score}점 · ${bandLabels[activeRisk.band]} · 근거 3개`,
      guard: "가중치와 근거를 동시에 표시"
    },
    {
      name: "② 돌봄 자원 후보 매칭",
      method: "지역 코드 일치 → 카테고리 필터 → 다양성 정렬",
      output: "후보 카드 3~5개",
      guard: "자연어 생성 없이 DB 결과만 표시"
    },
    {
      name: "③ 다국어 가족 안내",
      method: "공공 안내문 템플릿 + 표준 번역 사전",
      output: "한국어 + 외국어 1개",
      guard: "출력 직전 정규식 8개 검사"
    }
  ];

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <GitBranch size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">3-모델 의사결정 보조 구조</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {models.map((model) => (
          <article key={model.name} className="rounded-md border border-line p-3">
            <h3 className="font-bold text-ink">{model.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{model.method}</p>
            <p className="mt-2 rounded bg-panel px-2 py-1 text-sm font-semibold text-slate-700">{model.output}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{model.guard}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-line bg-panel p-3">
        <div className="mb-2 flex items-center gap-2">
          <Database size={17} className="text-teal" />
          <h3 className="font-bold text-ink">공공데이터 출처·확보 단계</h3>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {sources.map((source) => (
            <div key={source.id} className="rounded border border-line bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-ink">{source.name}</p>
                <span className="shrink-0 rounded bg-teal px-2 py-0.5 text-xs font-bold text-white">
                  {source.status}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">{source.provider}</p>
              <p className="mt-2 leading-5 text-slate-700">{source.use}</p>
              <p className="mt-2 text-xs text-slate-500">{source.updateCycle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetyZonePanel() {
  const zones = [
    ["Z1 의료법", "담당자 보조형, 기관 지정·예약·결제·연결 기능 없음"],
    ["Z2 노인장기요양보험법", "등급 판정이나 급여 결정을 수행하지 않음"],
    ["Z3 개인정보보호법", "실명·연락처·주민번호·상세주소 미수집"],
    ["Z4 HIRA 데이터 절차", "현재 버전은 가명 데이터와 공개 자료만 사용하며, 정식 절차 외 데이터 활용 없음"]
  ];

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">운영 원칙 4-Zone</h2>
      </div>
      <div className="grid gap-3">
        {zones.map(([name, control]) => (
          <div key={name} className="rounded border border-line bg-panel p-3">
            <p className="font-bold text-ink">{name}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{control}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PolicyAnalyticsPanel({
  patients,
  resources,
  cases,
  activePatient
}: Pick<SolutionOperationsProps, "patients" | "resources" | "cases" | "activePatient">) {
  const highCount = patients.filter((patient) => calculateRisk(patient).band === "HIGH").length;
  const b2gCount = cases.filter((item) => item.channel === "B2G").length;
  const activeRegionResources = resources.filter((resource) => resource.region === activePatient.region).length;
  const uniqueRegions = new Set(patients.map((patient) => patient.region)).size;
  const multilingualCount = patients.filter((patient) => patient.preferredLanguage !== "ko").length;
  const highRatio = Math.round((highCount / patients.length) * 100);
  const multilingualRatio = Math.round((multilingualCount / patients.length) * 100);
  const signals = cases
    .map((item) => {
      const patient = patients.find((entry) => entry.id === item.patientId);
      return patient ? assessCaseReview(patient, calculateRisk(patient), item) : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const reviewNeededCount = signals.filter((item) => item.windowStatus === "검토 필요").length;
  const expiredCount = signals.filter((item) => item.windowStatus === "72시간 초과").length;

  return (
    <section className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Building2 size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">정책·사업화 KPI 대시보드</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<FileCheck2 size={18} />} label="72시간 검토 사례" value={`${cases.length}건`} />
        <Metric icon={<UsersRound size={18} />} label="HIGH 신호 비율" value={`${highCount}/${patients.length}`} />
        <Metric icon={<ShieldCheck size={18} />} label="검토 필요 사례" value={`${reviewNeededCount}건`} />
        <Metric icon={<Database size={18} />} label="활성 지역 자원" value={`${activeRegionResources}건`} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        B2G 중심 사례 {b2gCount}건과 시군 커버리지 {uniqueRegions}개를 기준으로 담당자 검토 시간,
        안내 일관성, 72시간 초과 사례 {expiredCount}건을 누적해 분기 정책 리포트로 확장하는 구조입니다.
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <BarMetric label="HIGH 신호 비율" value={highRatio} />
        <BarMetric label="다국어 안내 비율" value={multilingualRatio} />
        <BarMetric label="B2G 사례 비율" value={Math.round((b2gCount / cases.length) * 100)} />
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="mb-2 text-teal">{icon}</div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function BarMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-line bg-panel p-3">
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-bold text-ink">{label}</span>
        <span className="font-black text-teal">{value}%</span>
      </div>
      <div className="h-2 rounded bg-white">
        <div className="h-2 rounded bg-teal" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
