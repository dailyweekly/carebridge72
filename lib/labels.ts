import type {
  CareResource,
  Comorbidity,
  DiagnosisGroup,
  Language,
  LivingArrangement,
  RegionCode,
  RiskBand
} from "./types";

export const regionLabels: Record<RegionCode, string> = {
  "GG-SUWON": "수원시",
  "GG-GOYANG": "고양시",
  "GG-SEONGNAM": "성남시",
  "GG-ANSAN": "안산시"
};

export const diagnosisLabels: Record<DiagnosisGroup, string> = {
  HEART_FAILURE: "심부전군",
  COPD: "만성폐쇄성폐질환군",
  STROKE: "뇌졸중군",
  PNEUMONIA: "폐렴군",
  FRAILTY: "노쇠군"
};

export const comorbidityLabels: Record<Comorbidity, string> = {
  DIABETES: "당뇨",
  CKD_STAGE_3: "만성콩팥병 3단계",
  HYPERTENSION: "고혈압",
  DEMENTIA: "인지저하",
  MOBILITY_LIMITATION: "이동 제한",
  NONE: "동반질환 없음"
};

export const categoryLabels: Record<CareResource["category"], string> = {
  VISITING_NURSING: "방문간호",
  HOME_CARE: "재가요양",
  DAY_CARE: "주야간보호",
  MEAL_SUPPORT: "식사지원",
  TRANSPORT: "이동지원"
};

export const languageLabels: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  vi: "Tieng Viet",
  zh: "中文"
};

export const bandLabels: Record<RiskBand, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

export const livingArrangementLabels: Record<LivingArrangement, string> = {
  ALONE: "단독 거주",
  WITH_FAMILY: "가족 동거",
  FACILITY: "시설 거주"
};
