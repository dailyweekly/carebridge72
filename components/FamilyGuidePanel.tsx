"use client";

import { Clipboard, Printer, ShieldCheck, ShieldX } from "lucide-react";
import { CaptureCaption } from "./CaptureCaption";
import type { FamilyGuide } from "@/lib/types";
import { languageLabels } from "@/lib/labels";

type FamilyGuidePanelProps = {
  koreanGuide: FamilyGuide;
  foreignGuide: FamilyGuide;
  onCopy?: () => void;
  showScreenNote?: boolean;
};

export function FamilyGuidePanel({ koreanGuide, foreignGuide, onCopy, showScreenNote = false }: FamilyGuidePanelProps) {
  const combined = `${koreanGuide.text}\n\n---\n\n${foreignGuide.text}`;
  const pass = koreanGuide.safety.pass && foreignGuide.safety.pass;

  return (
    <section id="guide" className="scroll-mt-20 rounded-md border border-line bg-white p-4 shadow-soft">
      {showScreenNote ? (
        <CaptureCaption
          title="화면 04 · 가족 안내"
          description="다국어 안내문, 운영 원칙 확인 결과, 출처와 갱신일을 함께 표시합니다."
        />
      ) : null}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {pass ? <ShieldCheck className="text-teal" size={20} /> : <ShieldX className="text-cranberry" size={20} />}
            <h2 className="text-lg font-bold text-ink">가족 안내문</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            한국어와 외국어 1개를 함께 생성하며, 운영 원칙에 맞지 않는 문구는 본문 표시를 차단합니다.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-teal bg-teal px-3 py-2 text-sm font-bold text-white"
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(combined);
            onCopy?.();
          }}
          title="안내문 복사"
        >
          <Clipboard size={16} />
          복사
        </button>
      </div>

      <div className="mb-4 rounded-md border border-line bg-panel p-3 text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className={pass ? "font-bold text-teal" : "font-bold text-cranberry"}>
            운영 원칙 확인: {pass ? "통과" : "담당자 검토 필요"}
          </span>
          <span className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-600">
            전달 전 담당자 최종 확인
          </span>
        </div>
        {!pass ? (
          <span className="ml-2 text-slate-700">
            {[
              ...koreanGuide.safety.flagged,
              ...foreignGuide.safety.flagged
            ].map((flag) => flag.snippet).join(", ")}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <GuideText language={koreanGuide.language} text={koreanGuide.text} />
        <GuideText language={foreignGuide.language} text={foreignGuide.text} />
      </div>

      <div className="mt-3 rounded-md border border-line bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Printer size={16} className="text-teal" />
          <h3 className="text-sm font-bold text-ink">가족 전달 전 확인 항목</h3>
        </div>
        <ul className="grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-3">
          <li className="rounded-md bg-panel p-2">응급 신호 발생 시 공공 창구 또는 응급 서비스를 먼저 안내</li>
          <li className="rounded-md bg-panel p-2">식사·수분·휴식·외래 방문 준비만 체크리스트화</li>
          <li className="rounded-md bg-panel p-2">담당자 검토 후 가족에게 전달하는 간접 수령 구조 유지</li>
        </ul>
      </div>

      <div className="mt-3 rounded-md border border-line bg-panel p-3 text-xs leading-5 text-slate-600">
        <span className="font-bold text-ink">출처·갱신일</span> 공공 안내문 템플릿 (보건복지부·HIRA,
        {koreanGuide.updatedAt} 기준).
        <span className="break-all">
          원문 기준 URL: {[...new Set([...koreanGuide.sourceUrls, ...foreignGuide.sourceUrls])].join(" · ")}
        </span>
      </div>
    </section>
  );
}

function GuideText({ language, text }: Pick<FamilyGuide, "language" | "text">) {
  return (
    <article className="rounded-md border border-line p-3">
      <h3 className="mb-2 text-sm font-bold text-teal">{languageLabels[language]}</h3>
      <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{text}</p>
    </article>
  );
}
