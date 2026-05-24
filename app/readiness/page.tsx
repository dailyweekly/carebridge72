import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  GitCompareArrows,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  Timer,
  Workflow
} from "lucide-react";
import Link from "next/link";

const pilotSteps = [
  ["1", "업무 대상 확정", "퇴원 후 72시간 내 확인이 필요한 진단군과 담당 부서를 정합니다."],
  ["2", "데이터 연결", "가명 사례와 공개 API를 먼저 연결하고, HIRA 맞춤형 데이터는 별도 절차로 반영합니다."],
  ["3", "담당자 검수", "위험 신호, 후보 정보, 가족 안내문 초안이 실제 업무 흐름에 맞는지 확인합니다."],
  ["4", "운영 전환", "접근 코드, 처리 이력, 운영 원칙 검사를 유지한 상태로 제한 배포합니다."]
];

const commercialFit = [
  {
    icon: <Building2 size={18} />,
    title: "도입 대상",
    body: "시군 통합돌봄 전담조직, 병원 사회사업실, 퇴원지원 협력기관"
  },
  {
    icon: <Workflow size={18} />,
    title: "도입 형태",
    body: "4주 시범 운영, 기관 단위 사용, 지자체·병원 협력형 파일럿"
  },
  {
    icon: <FileText size={18} />,
    title: "제공 산출물",
    body: "위험 신호, 지역 후보 정보, 가족 안내문 초안, 담당자 인계 요약"
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "운영 원칙",
    body: "기관 지정·예약·연결 없이 담당자 판단을 돕는 후보 정보만 제공"
  }
];

const readinessItems = [
  "Vercel 배포 완료 및 `/api/health` 운영 상태 확인 가능",
  "Claude Haiku 기반 AI 초안 생성과 기본 초안 대체 구조",
  "NHIS 장기요양기관 검색 서비스와 HIRA 병원정보서비스 연동 준비",
  "가명 데이터 기반 시연, 민감정보 입력 차단, 운영 원칙 검사",
  "HIRA 맞춤형/K-OMOP 데이터 수령 후 모델 고도화 가능"
];

const adoptionPackages = [
  {
    title: "4주 업무검증",
    target: "시군 1개 부서 또는 병원 1개 팀",
    scope: "가명 사례 기반 업무 흐름 검증, 담당자 피드백 반영, 공공 API 연결 확인",
    commercial: "초기 구축비 또는 공모·실증 과제로 시작"
  },
  {
    title: "기관별 제한운영",
    target: "시군 통합돌봄 전담조직·병원 사회사업실",
    scope: "접근 코드, 처리 이력, 민감정보 차단, AI 초안 비용 통제 유지",
    commercial: "기관 단위 월 사용료와 운영지원비로 전환"
  },
  {
    title: "데이터 고도화",
    target: "HIRA 맞춤형/K-OMOP 데이터 수령 후",
    scope: "보안 분석 환경 내 모델 학습, 성능지표·SHAP 설명 산출, ONNX 추론 교체",
    commercial: "모델 고도화 과업과 유지관리 계약으로 분리"
  }
];

const operationControls = [
  "AI 초안 생성은 `/workspace` 접근 코드 확인 후에만 실행",
  "Claude 호출 실패 시 동일 입력 기반 기본 초안으로 업무 흐름 유지",
  "공공 API 지연 시 예비 후보로 화면 중단 방지",
  "실명·연락처·주민번호·상세주소 입력 차단",
  "출력 전 운영 원칙 검사로 기관 지정·예약·결제 표현 차단"
];

const marketPosition = [
  {
    title: "해외 discharge AI와 다른 점",
    body: "기관 연결 자동화보다 국내 통합돌봄 담당자의 72시간 검토와 문서화에 집중합니다."
  },
  {
    title: "기관 검색 서비스와 다른 점",
    body: "단순 병원·요양기관 조회가 아니라 위험 신호, 후보 비교, 가족 안내, 인계 요약을 한 흐름으로 묶습니다."
  },
  {
    title: "B2C 돌봄 플랫폼과 다른 점",
    body: "가족에게 직접 기관을 추천하지 않고 공공 담당자와 병원 사회사업실의 판단 보조 화면으로 작동합니다."
  }
];

export default function ReadinessPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal px-2.5 py-1 text-sm font-black text-white">
                CareBridge72
              </span>
              <span className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-bold text-slate-700">
                도입 검토
              </span>
            </div>
            <h1 className="text-2xl font-black leading-tight text-ink sm:text-4xl">
              퇴원지원 업무에 바로 붙일 수 있는 담당자 보조 화면
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
              케어브릿지72는 환자용 연결 서비스가 아니라, 공공 담당자와 병원 사회사업실이
              퇴원 직후 돌봄 공백을 검토하고 문서화하는 업무 화면입니다.
            </p>
            <div className="mt-5 grid gap-2 md:grid-cols-3">
              <ProofTile icon={<Timer size={16} />} label="시범 운영" value="3분 내 핵심 흐름 확인" />
              <ProofTile icon={<LockKeyhole size={16} />} label="AI 비용 통제" value="접근 코드 후 초안 생성" />
              <ProofTile icon={<Stethoscope size={16} />} label="업무 경계" value="담당자 판단 보조" />
            </div>
          </div>

          <div className="rounded-md border border-line bg-panel p-3">
            <p className="text-xs font-black text-teal">도입 준비도</p>
            <p className="mt-1 text-lg font-black text-ink">도입 검토용 확인 경로</p>
            <div className="mt-3 grid gap-2">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal px-4 py-3 text-sm font-black text-white"
                href="/"
              >
                사례 검토 화면
                <ArrowRight size={16} />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-black text-slate-800"
                href="/workspace"
              >
                AI 작업 화면
                <ArrowRight size={16} />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-black text-slate-800"
                href="/status"
              >
                운영 상태 확인
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {commercialFit.map((item) => (
          <article key={item.title} className="rounded-md border border-line bg-white p-4 shadow-soft">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-teal text-white">
              {item.icon}
            </div>
            <h2 className="text-lg font-black text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-teal" />
              <h2 className="text-xl font-black text-ink">도입·과금 단위</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              사용자 화면과 관리자 분석을 분리하고, 먼저 담당자 업무 흐름을 검증한 뒤 기관 단위 운영으로 전환합니다.
            </p>
          </div>
          <span className="rounded-md border border-line bg-panel px-3 py-1 text-sm font-bold text-slate-700">
            4주 검증 → 제한운영 → 데이터 고도화
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {adoptionPackages.map((item) => (
            <article key={item.title} className="rounded-md border border-line bg-panel p-4">
              <h3 className="text-lg font-black text-ink">{item.title}</h3>
              <dl className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                <PackageRow label="대상" value={item.target} />
                <PackageRow label="범위" value={item.scope} />
                <PackageRow label="수익화" value={item.commercial} />
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <GitCompareArrows size={20} className="text-teal" />
          <h2 className="text-xl font-black text-ink">시장 내 차별화 포지션</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {marketPosition.map((item) => (
            <article key={item.title} className="rounded-md border border-line bg-panel p-4">
              <h3 className="font-black text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck size={20} className="text-teal" />
            <h2 className="text-xl font-black text-ink">파일럿 도입 절차</h2>
          </div>
          <div className="grid gap-3">
            {pilotSteps.map(([number, title, body]) => (
              <article key={number} className="grid gap-3 rounded-md border border-line bg-panel p-3 sm:grid-cols-[40px_1fr]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-black text-white">
                  {number}
                </span>
                <div>
                  <h3 className="font-black text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-teal" />
            <h2 className="text-xl font-black text-ink">현재 준비도</h2>
          </div>
          <ul className="grid gap-2">
            {readinessItems.map((item) => (
              <li key={item} className="flex gap-2 rounded-md border border-line bg-panel p-3 text-sm leading-6 text-slate-700">
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-teal" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-md border border-line bg-white p-3 text-sm leading-6 text-slate-700">
            <p className="font-black text-ink">상용 전환 전제</p>
            <p className="mt-1">
              실환자 데이터 저장 없이 시작하고, 기관별 보안·개인정보 검토 후 HIRA 수령 데이터는
              보안 분석 환경에서만 모델 고도화에 사용합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-teal" />
          <h2 className="text-xl font-black text-ink">운영 통제</h2>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {operationControls.map((item) => (
            <div key={item} className="rounded-md border border-line bg-panel p-3 text-sm leading-6 text-slate-700">
              <CheckCircle2 size={16} className="mb-2 text-teal" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function PackageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md bg-white p-2">
      <dt className="text-xs font-black text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ProofTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-3">
      <div className="flex items-center gap-2 text-sm font-black text-ink">
        <span className="text-teal">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">{value}</p>
    </div>
  );
}
