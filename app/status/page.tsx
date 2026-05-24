import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  FileJson,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import Link from "next/link";
import { getIntegrationReadiness } from "@/lib/data-integrations";
import { getServiceHealth } from "@/lib/service-health";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  const health = getServiceHealth();
  const integrations = getIntegrationReadiness();
  const isOk = health.status === "ok";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal px-2.5 py-1 text-sm font-black text-white">CareBridge72</span>
              <span className="rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-bold text-slate-700">
                운영 상태
              </span>
            </div>
            <h1 className="text-2xl font-black leading-tight text-ink sm:text-4xl">
              배포·연동·운영 통제를 한 화면에서 확인합니다
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
              이 화면은 담당자 업무 화면과 분리된 운영 확인용입니다. 비밀 키 값은 표시하지 않고 연결 상태와 통제 방식만 보여줍니다.
            </p>
          </div>
          <div className={`rounded-md border p-4 ${isOk ? "border-teal bg-teal-50" : "border-amber-300 bg-amber-50"}`}>
            <div className="flex items-center gap-2">
              {isOk ? <CheckCircle2 size={20} className="text-teal" /> : <TriangleAlert size={20} className="text-amber-700" />}
              <p className={`text-sm font-black ${isOk ? "text-teal" : "text-amber-800"}`}>
                {isOk ? "필수 연동 준비 완료" : "필수 연동 확인 필요"}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              앱 버전 {health.appVersion} · 모델 {health.riskModelVersion}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">갱신 {formatGeneratedAt(health.generatedAt)}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatusTile icon={<Activity size={18} />} label="서비스 상태" value={isOk ? "정상" : "확인 필요"} />
        <StatusTile icon={<Sparkles size={18} />} label="AI 초안" value={modeLabel(health.dataMode.llm)} />
        <StatusTile icon={<Database size={18} />} label="공공데이터" value={modeLabel(health.dataMode.publicApi)} />
        <StatusTile icon={<ShieldCheck size={18} />} label="출력 검사" value="사용 중" />
      </section>

      <section className="mt-5 rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Database size={20} className="text-teal" />
          <h2 className="text-xl font-black text-ink">연동 준비도</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {integrations.map((item) => (
            <article key={item.id} className="rounded-md border border-line bg-panel p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-teal">{item.provider}</p>
                  <h3 className="mt-1 font-black text-ink">{item.name}</h3>
                </div>
                <StageBadge stage={item.stage} />
              </div>
              <p className="text-sm leading-6 text-slate-700">{item.purpose}</p>
              <p className="mt-3 rounded-md bg-white p-2 text-xs leading-5 text-slate-600">{item.obtainFrom}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <LockKeyhole size={20} className="text-teal" />
            <h2 className="text-xl font-black text-ink">운영 통제</h2>
          </div>
          <div className="grid gap-2">
            <ControlRow label="AI 접근" value={controlLabel(health.operationalControls.workspaceAccess)} />
            <ControlRow label="AI 비용 통제" value="작업 화면 접근 후 실행" />
            <ControlRow label="AI 실패 대응" value="기본 초안으로 전환" />
            <ControlRow label="공공 API 실패 대응" value="예비 후보로 전환" />
            <ControlRow label="민감정보 입력" value="패턴 차단" />
            <ControlRow label="환자 식별자" value="수집하지 않음" />
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <RotateCcw size={20} className="text-teal" />
            <h2 className="text-xl font-black text-ink">다음 확인 경로</h2>
          </div>
          <div className="grid gap-2">
            <StatusLink href="/" label="사례 검토 화면" />
            <StatusLink href="/workspace" label="AI 작업 화면" />
            <StatusLink href="/readiness" label="도입 검토 화면" />
            <StatusLink href="/api/health" label="JSON 운영 상태 API" icon={<FileJson size={16} />} />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-teal text-white">{icon}</div>
      <p className="text-xs font-black text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </article>
  );
}

function StageBadge({ stage }: { stage: "configured" | "missing" | "procedural" }) {
  const label = stage === "configured" ? "설정됨" : stage === "procedural" ? "별도 절차" : "미설정";
  const className =
    stage === "configured"
      ? "border-teal bg-teal-50 text-teal"
      : stage === "procedural"
        ? "border-slate-300 bg-white text-slate-700"
        : "border-amber-300 bg-amber-50 text-amber-800";
  return <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function ControlRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 rounded-md border border-line bg-panel p-3 sm:grid-cols-[140px_minmax(0,1fr)]">
      <p className="text-sm font-black text-ink">{label}</p>
      <p className="text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function StatusLink({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <Link
      className="inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-line bg-panel px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
      href={href}
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight size={16} />
    </Link>
  );
}

function modeLabel(value: string) {
  if (value === "claude-enabled") return "Claude 연결";
  if (value === "enabled-with-fallback") return "API 연결";
  if (value === "fallback-only") return "기본 모드";
  if (value === "procedural-request") return "별도 절차";
  return value;
}

function controlLabel(value: string) {
  if (value === "enabled") return "환경변수 코드 사용";
  if (value === "default-code") return "기본 코드 사용";
  return value;
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false });
}
