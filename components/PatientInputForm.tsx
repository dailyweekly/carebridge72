"use client";

import { UserRoundCheck } from "lucide-react";
import {
  comorbidityLabels,
  diagnosisLabels,
  languageLabels,
  livingArrangementLabels,
  regionLabels
} from "@/lib/labels";
import { CaptureCaption } from "./CaptureCaption";
import { detectPrivacyRisk } from "@/lib/privacy";
import type { Comorbidity, DiagnosisGroup, Language, LivingArrangement, Patient, RegionCode } from "@/lib/types";

type PatientInputFormProps = {
  patient: Patient;
  patients: Patient[];
  onChange: (patient: Patient) => void;
  onPrivacyBlocked?: (detail: string) => void;
  foreignLanguage: Exclude<Language, "ko">;
  onForeignLanguageChange: (language: Exclude<Language, "ko">) => void;
  showScreenNote?: boolean;
};

const diagnoses = Object.keys(diagnosisLabels) as DiagnosisGroup[];
const regions = Object.keys(regionLabels) as RegionCode[];
const livingArrangements = Object.keys(livingArrangementLabels) as LivingArrangement[];
const comorbidities = Object.keys(comorbidityLabels).filter((item) => item !== "NONE") as Comorbidity[];

export function PatientInputForm({
  patient,
  patients,
  onChange,
  onPrivacyBlocked,
  foreignLanguage,
  onForeignLanguageChange,
  showScreenNote = false
}: PatientInputFormProps) {
  const fieldClass = "mt-1 min-h-11 w-full rounded-md border border-line bg-white px-3 py-2 shadow-sm";

  function update<T extends keyof Patient>(key: T, value: Patient[T]) {
    onChange({ ...patient, [key]: value });
  }

  function toggleComorbidity(item: Comorbidity) {
    const current = patient.comorbidities.includes("NONE") ? [] : patient.comorbidities;
    const next = current.includes(item)
      ? current.filter((entry) => entry !== item)
      : [...current, item];
    update("comorbidities", next.length > 0 ? next : ["NONE"]);
  }

  return (
    <aside className="rounded-md border border-line bg-white p-4 shadow-soft">
      {showScreenNote ? (
        <CaptureCaption
          title="화면 01 · 사례 입력"
          description="식별정보 없이 담당자 검토에 필요한 항목만 입력합니다."
        />
      ) : null}
      <div className="mb-4 flex items-center gap-2">
        <UserRoundCheck className="text-teal" size={20} />
        <h2 className="text-lg font-bold text-ink">가명 환자 입력</h2>
      </div>
      <div className="mb-4 rounded-md border border-line bg-panel p-3 text-sm leading-6 text-slate-700">
        입력값을 바꾸면 위험 신호, 후보 정보, 가족 안내문이 자동 갱신됩니다.
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">Preset</span>
          <select
            id="patient-preset"
            name="patientPreset"
            className={fieldClass}
            value={patient.id}
            onChange={(event) => {
              const selected = patients.find((item) => item.id === event.target.value);
              if (selected) onChange(selected);
            }}
          >
            {patients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {regionLabels[item.region]} · {diagnosisLabels[item.primaryDiagnosisGroup]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">나이</span>
            <input
              className={fieldClass}
              type="number"
              min={40}
              max={99}
              value={patient.age}
              onChange={(event) => update("age", Number(event.target.value))}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">퇴원일</span>
            <input
              className={fieldClass}
              type="date"
              value={patient.dischargeDate}
              onChange={(event) => update("dischargeDate", event.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-slate-600">진단군</span>
          <select
            className={fieldClass}
            value={patient.primaryDiagnosisGroup}
            onChange={(event) => update("primaryDiagnosisGroup", event.target.value as DiagnosisGroup)}
          >
            {diagnoses.map((item) => (
              <option key={item} value={item}>
                {diagnosisLabels[item]}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-xs font-semibold text-slate-600">동반질환</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {comorbidities.map((item) => (
              <label
                key={item}
                className={`flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                  patient.comorbidities.includes(item) ? "border-teal bg-teal-50 text-ink" : "border-line bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={patient.comorbidities.includes(item)}
                  onChange={() => toggleComorbidity(item)}
                />
                {comorbidityLabels[item]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs font-semibold text-slate-600">거주지역</span>
          <select
            className={fieldClass}
            value={patient.region}
            onChange={(event) => update("region", event.target.value as RegionCode)}
          >
            {regions.map((item) => (
              <option key={item} value={item}>
                {regionLabels[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-600">생활환경</span>
          <select
            className={fieldClass}
            value={patient.livingArrangement}
            onChange={(event) => update("livingArrangement", event.target.value as LivingArrangement)}
          >
            {livingArrangements.map((item) => (
              <option key={item} value={item}>
                {livingArrangementLabels[item]}
              </option>
            ))}
          </select>
        </label>

        <label className={`flex min-h-11 items-center justify-between rounded-md border px-3 py-2 transition ${
          patient.caregiverPresent ? "border-teal bg-teal-50" : "border-line bg-white"
        }`}>
          <span className="text-sm font-semibold text-slate-700">상주 돌봄자 있음</span>
          <input
            type="checkbox"
            checked={patient.caregiverPresent}
            onChange={(event) => update("caregiverPresent", event.target.checked)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">기본 언어</span>
            <select
              className={fieldClass}
              value={patient.preferredLanguage}
              onChange={(event) => update("preferredLanguage", event.target.value as Language)}
            >
              {(Object.keys(languageLabels) as Language[]).map((item) => (
                <option key={item} value={item}>
                  {languageLabels[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">외국어 안내</span>
            <select
              className={fieldClass}
              value={foreignLanguage}
              onChange={(event) => onForeignLanguageChange(event.target.value as Exclude<Language, "ko">)}
            >
              <option value="en">English</option>
              <option value="vi">Tieng Viet</option>
              <option value="zh">中文</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-slate-600">비고</span>
          <textarea
            className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm leading-6 shadow-sm"
            value={patient.notes}
            onChange={(event) => {
              const nextValue = event.target.value;
              const risks = detectPrivacyRisk(nextValue);
              if (risks.length > 0) {
                onPrivacyBlocked?.(`${risks.map((risk) => risk.type).join(", ")} 패턴 입력을 차단했습니다.`);
                return;
              }
              update("notes", nextValue);
            }}
            maxLength={160}
          />
          <div className="mt-1 flex items-start justify-between gap-3 text-xs leading-5 text-slate-500">
            <span>실명, 연락처, 주민번호, 상세주소는 입력하지 않습니다. 감지 시 반영하지 않습니다.</span>
            <span className="shrink-0 font-bold">{patient.notes.length}/160</span>
          </div>
        </label>
      </div>
    </aside>
  );
}
