export type IntegrationStage = "configured" | "missing";

export type DataIntegration = {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  envKeys: string[];
  obtainFrom: string;
  url: string;
  priority: "P1" | "P2" | "P3";
};

export type IntegrationStatus = DataIntegration & {
  stage: IntegrationStage;
  configuredKeys: string[];
  missingKeys: string[];
};

export const dataIntegrations: DataIntegration[] = [
  {
    id: "ANTHROPIC_CLAUDE",
    name: "Claude Messages API",
    provider: "Anthropic",
    purpose: "담당자 인계 요약과 가족 안내문 초안 생성",
    envKeys: ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL", "WORKSPACE_ACCESS_CODE"],
    obtainFrom: "Anthropic Console에서 API 키 발급 후 Vercel 환경변수 등록",
    url: "https://platform.claude.com/docs/en/build-with-claude/working-with-messages",
    priority: "P1"
  },
  {
    id: "DATA_GO_KR_NHIS_LTC",
    name: "국민건강보험공단 장기요양기관 검색 서비스",
    provider: "공공데이터포털·국민건강보험공단",
    purpose: "방문요양, 방문간호, 주야간보호 후보 데이터 갱신",
    envKeys: ["DATA_GO_KR_SERVICE_KEY"],
    obtainFrom: "공공데이터포털 로그인 → 활용신청 → 일반 인증키 발급",
    url: "https://www.data.go.kr/data/15059029/openapi.do",
    priority: "P1"
  },
  {
    id: "DATA_GO_KR_HIRA_HOSPITAL",
    name: "건강보험심사평가원 병원정보서비스",
    provider: "공공데이터포털·건강보험심사평가원",
    purpose: "병원 사회사업실 PoC와 의료기관 기준정보 확인",
    envKeys: ["DATA_GO_KR_SERVICE_KEY"],
    obtainFrom: "공공데이터포털 로그인 → 활용신청 → 병원정보서비스 승인",
    url: "https://www.data.go.kr/data/15001698/openapi.do",
    priority: "P2"
  },
  {
    id: "KOSIS",
    name: "KOSIS OpenAPI",
    provider: "통계청",
    purpose: "시군구 고령화, 인구 구조, 정책 KPI 보강",
    envKeys: ["KOSIS_API_KEY"],
    obtainFrom: "KOSIS 공유서비스 → OPEN API 인증키 신청",
    url: "https://kosis.kr/openapi/index/",
    priority: "P2"
  },
  {
    id: "GEOCODING",
    name: "주소·좌표 변환 API",
    provider: "도로명주소 개발자센터 또는 SGIS/VWorld",
    purpose: "기관 주소 좌표화와 거리 계산 고도화",
    envKeys: ["GEOCODING_API_KEY"],
    obtainFrom: "도로명주소, SGIS, VWorld 중 운영 정책에 맞는 키 발급",
    url: "https://www.juso.go.kr",
    priority: "P2"
  },
  {
    id: "HIRA_CDM",
    name: "HIRA K-OMOP/CDM 분석 환경",
    provider: "건강보험심사평가원",
    purpose: "재입원 위험 모델 학습과 SHAP 설명 산출",
    envKeys: [],
    obtainFrom: "보건의료빅데이터개방시스템 CDM 이용신청 후 보안 분석 환경 내 수행",
    url: "https://opendata.hira.or.kr/op/opb/selectHelhMedDataInfoView.do",
    priority: "P3"
  }
];

export function getIntegrationReadiness(env: Record<string, string | undefined> = process.env) {
  return dataIntegrations.map((integration): IntegrationStatus => {
    const configuredKeys = integration.envKeys.filter((key) => Boolean(env[key]));
    const missingKeys = integration.envKeys.filter((key) => !env[key]);
    return {
      ...integration,
      configuredKeys,
      missingKeys,
      stage: missingKeys.length === 0 ? "configured" : "missing"
    };
  });
}
