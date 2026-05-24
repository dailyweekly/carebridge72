type LegalSafetyBannerProps = {
  placement: "top" | "bottom";
};

const copy =
  "케어브릿지72는 특정 의료기관·장기요양기관을 직접 추천·연결하지 않습니다. 시스템은 공공 담당자의 검토를 돕는 후보 정보와 위험 신호를 제공하며, 최종 판단과 전달은 시군 통합돌봄 전담조직 또는 병원 내 담당자가 수행합니다.";
const compactCopy = "담당자 검토용 후보 정보만 제공 · 직접 추천/연결 없음 · 개인정보 최소화";

export function LegalSafetyBanner({ placement }: LegalSafetyBannerProps) {
  const sticky = placement === "top" ? "sticky top-0 z-40" : "";
  const text = placement === "top" ? compactCopy : copy;
  return (
    <div className={`${sticky} border-y border-line bg-white/95 px-4 py-2 text-sm text-slate-700 backdrop-blur`}>
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <span className="mt-0.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-900 whitespace-nowrap">
          운영 원칙
        </span>
        <p className="m-0 leading-6">{text}</p>
      </div>
    </div>
  );
}
