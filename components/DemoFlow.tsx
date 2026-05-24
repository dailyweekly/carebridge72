import { CheckCircle2 } from "lucide-react";

const steps = [
  ["1", "사례 입력", "퇴원 정보와 생활 환경을 확인"],
  ["2", "위험 검토", "점수와 핵심 근거를 함께 확인"],
  ["3", "자원 후보", "지역 기반 후보군을 비교"],
  ["4", "안내문 작성", "가족 전달 전 운영 원칙 확인"],
  ["5", "담당자 판단", "검토 이력과 정책 지표 확인"]
];

export function DemoFlow() {
  return (
    <section className="mb-5 rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 size={20} className="text-teal" />
        <h2 className="text-lg font-bold text-ink">사례 검토 흐름</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        {steps.map(([number, title, copy]) => (
          <article key={number} className="rounded-md border border-line bg-panel p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-sm font-black text-white">
                {number}
              </span>
              <h3 className="font-bold text-ink">{title}</h3>
            </div>
            <p className="text-xs leading-5 text-slate-600">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
