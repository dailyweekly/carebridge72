# 케어브릿지72 데이터·API 확보 계획

## 1. 즉시 연동 대상

| 우선순위 | 데이터/API | 확보 루트 | 환경변수 | 적용 기능 |
| --- | --- | --- | --- | --- |
| P1 | Claude Messages API | Anthropic Console에서 API 키 발급 | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `WORKSPACE_ACCESS_CODE` | 담당자 인계 요약, 가족 안내 초안 |
| P1 | 국민건강보험공단 장기요양기관 검색 서비스 | 공공데이터포털 로그인 → 활용신청 → 일반 인증키 발급 | `DATA_GO_KR_SERVICE_KEY` (`NHIS_LTC_API_URL`은 선택 override) | 방문요양, 방문간호, 주야간보호 후보 갱신 |
| P2 | 건강보험심사평가원 병원정보서비스 | 공공데이터포털 로그인 → 활용신청 → 병원정보서비스 승인 | `DATA_GO_KR_SERVICE_KEY` (`HIRA_HOSP_API_URL`은 선택 override) | 병원 사회사업실 PoC, 의료기관 기준정보 확인 |
| P2 | KOSIS OpenAPI | KOSIS 공유서비스 → OPEN API 인증키 신청 | `KOSIS_API_KEY` | 시군구 고령화, 인구 구조, 지역 수요 지표 |
| P2 | 주소·좌표 변환 API | 도로명주소 개발자센터, SGIS, VWorld 중 선택 | `GEOCODING_API_KEY` | 기관 주소 좌표화, 거리 계산 |

## 2. HIRA 데이터 수령 후 처리

| 단계 | 데이터 | 처리 원칙 | 산출물 |
| --- | --- | --- | --- |
| 1 | 맞춤형 익명통계 | 외부 반출 가능한 익명 통계만 위험 규칙 보정에 사용 | 진단군별 분포, 공백 지표 |
| 2 | K-OMOP/CDM | 보안 분석 환경 내에서만 코호트 추출·학습 수행 | AUROC, calibration, SHAP top feature |
| 3 | 모델 반출 | 원자료·식별 가능한 통계 반출 금지 | ONNX 가중치, 모델 카드, 성능표 |

## 3. 운영 반영 순서

1. Vercel 환경변수 등록: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `WORKSPACE_ACCESS_CODE`.
2. 공공데이터포털에서 NHIS 장기요양기관 검색 서비스 활용신청.
3. 공공데이터포털에서 HIRA 병원정보서비스 활용신청.
4. KOSIS 공유서비스 인증키 신청.
5. 지자체 식사지원·이동지원 CSV를 수원, 고양, 성남, 안산 순서로 수집.
6. `/api/integrations/status`에서 환경변수 설정 상태와 별도 절차 필요 항목을 확인.
7. HIRA 수령 후 `ml/` 보안 분석 파이프라인을 별도 환경에서 실행.

## 3-1. NHIS 장기요양기관 API 반영 방식

- `/api/resources`는 `DATA_GO_KR_SERVICE_KEY`가 있으면 NHIS 장기요양기관 검색 서비스를 먼저 호출한다.
- API 호출 실패, 키 누락, 응답 파싱 실패 시 기존 mock 후보로 자동 전환한다.
- 원천 기관명은 내부 notes에만 남기고, 전화번호 등 직접 연락 정보는 화면에 표시하지 않는다.
- 화면의 `publicContact`는 항상 `시군 통합돌봄 전담창구`로 정규화한다.
- 식사지원·이동지원은 NHIS 장기요양기관 API에 없을 수 있으므로 지자체 데이터로 별도 보강한다.

## 3-2. HIRA 병원정보서비스 반영 방식

- `/api/hospitals`는 병원 사회사업실 PoC와 기준정보 확인용 API이다.
- HIRA 병원정보서비스의 `getHospBasisList`를 호출해 병원명, 종별, 시군구, 주소 요약만 정규화한다.
- 요청 파라미터는 공공데이터 문서 표기와 맞춰 `ServiceKey`, `pageNo`, `numOfRows`, `sidoCd`를 사용한다.
- HTTPS 호출이 네트워크 지연으로 실패하면 HTTP 경로로 1회 재시도하고, 화면에는 연결 상태를 `공공데이터 반영`, `연결됨 · 지역 결과 없음`, `API 키 미설정`, `승인 또는 키 확인 필요`, `응답 지연`으로 구분해 표시한다.
- 전화번호와 홈페이지 URL은 환자 대상 화면에 표시하지 않는다.
- 이 API는 환자 대상 기관 지정, 예약, 연결에 사용하지 않는다.

## 4. 금지 범위

- HIRA 원자료를 Vercel, GitHub, 로컬 공개 저장소로 반출하지 않는다.
- 특정 의료기관·장기요양기관을 환자에게 추천, 예약, 연결, 결제하지 않는다.
- 실명, 전화번호, 주민번호, 상세주소를 서비스 입력값으로 저장하지 않는다.
- 약물 상호작용, 복약 지시, 치료 지시는 현 MVP 범위에서 제외한다.
