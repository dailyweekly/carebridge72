import { ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  ["1", "사례 입력", "퇴원 정보와 생활 환경을 확인", "#case-review"],
  ["2", "위험 검토", "점수와 핵심 근거를 함께 확인", "#risk"],
  ["3", "자원 후보", "지역 기반 후보군을 비교", "#candidates"],
  ["4", "안내문 작성", "가족 전달 전 운영 원칙 확인", "#guide"],
  ["5", "담당자 판단", "판단 기록과 인계 요약 확인", "#decision"]
];

export function DemoFlow() {
  return (
    <section className="mb-5 rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">사례 검토 흐름</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        {steps.map(([number, title, copy, href]) => (
          <a
            key={number}
            className="group rounded-md border border-line bg-panel p-3 transition hover:border-teal hover:bg-white hover:shadow-soft"
            href={href}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-sm font-black text-white">
                {number}
              </span>
              <h3 className="font-bold text-ink">{title}</h3>
              <ArrowRight size={14} className="ml-auto text-slate-300 transition group-hover:text-teal" />
            </div>
            <p className="text-xs leading-5 text-slate-600">{copy}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
