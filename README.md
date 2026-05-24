# 케어브릿지72

퇴원 후 72시간 동안 시군 통합돌봄 전담조직과 병원 사회사업실 담당자가 위험 신호, 지역 돌봄 자원 후보 정보, 다국어 가족 안내문, 정책 KPI를 검토하는 담당자 보조형 SaaS입니다. 현재 버전은 실제 환자 데이터, 외부 의료 API, 데이터베이스를 사용하지 않습니다.

## 1. 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 고정 시연 화면은 `http://localhost:3000/demo`, 실제 AI 문서화 작업 화면은 `http://localhost:3000/workspace`, 별첨 캡처 화면은 `http://localhost:3000/capture`입니다.

Vercel 배포 URL:

```text
https://carebridge72.vercel.app
https://carebridge72.vercel.app/workspace
https://carebridge72.vercel.app/capture
```

검증 명령:

```bash
npm run test
npm run check:legal
npm run build
npm run verify:submission
```

캡처 산출물 생성:

```bash
npm run capture
```

`captures/01-input.png`, `captures/02-risk.png`, `captures/03-candidates.png`, `captures/04-guide.png`, `captures/05-full.png`가 생성됩니다.

## 2. 기술 스택

Next.js 16 App Router, React 19, TypeScript, TailwindCSS, Vitest, Playwright, mock JSON only. Brief의 Next.js 14+ / React 18+ 조건을 상위 호환 버전으로 충족합니다. 모델 구조는 규칙 기반 surrogate를 사용하며, HIRA 정식 데이터 수령 후 ONNX 추론 모듈로 교체할 수 있도록 API와 순수 함수 경계를 분리했습니다. `/workspace`는 Claude Messages API 연동 준비가 된 LLM 문서화 보조 화면이며, 기본값은 `claude-3-5-haiku-20241022`입니다. `ANTHROPIC_API_KEY`가 없으면 동일 입력 기반 예비 초안을 생성합니다.

## 3. 데모 시나리오

1. 0:00-0:30: 메인 페이지 또는 `/capture`로 진입해 `P003` 프리셋을 확인합니다.
2. 0:30-1:00: 재입원 위험 신호 카드에서 HIGH 78점, 근거 3개, 모델 버전을 확인합니다.
3. 1:00-1:35: 수원시 지역 돌봄 자원 후보 5건과 담당자 검토 상태를 확인합니다.
4. 1:35-2:15: 한국어와 영어 가족 안내문, 운영 원칙 확인 통과 상태를 확인합니다.
5. 2:15-2:45: 담당자 판단 패널에서 권장 다음 행동, 체크리스트, 인계 요약을 확인합니다.
6. 2:45-3:00: 운영 원칙 배너와 4-Zone 통제 패널을 보여주며 최종 판단은 공공 담당자가 수행한다는 점을 강조합니다.

LLM 시연은 `/workspace`에서 진행합니다. 담당자가 사례를 선택한 뒤 `인계 요약 생성` 또는 `가족 안내 초안` 버튼을 누르면, 서버 route가 LLM 또는 예비 초안 생성기를 호출하고 운영 원칙 확인을 거친 결과만 표시합니다.

고정 시연 URL은 `http://localhost:3000/demo`입니다.

## 4. mock data 설명

`data/patients.mock.json`: P001-P005 가명 환자 8항목 정보입니다. 성명, 주민번호, 전화번호, 상세주소는 없습니다.

`data/care_resources.mock.json`: 경기도 4개 시군별 가명 돌봄 자원 후보 정보 20건입니다. 기관 실명, 예약, 결제, 직접 연결 정보는 없습니다.

`data/risk_rules.json`: 나이, 진단군, 동반질환, 돌봄자 유무를 합산하는 재현 가능한 위험 점수 규칙입니다. 모델 버전은 `CB72-RULE-XGB-SURROGATE-2026.05`입니다.

`data/messages.mock.json`: 한국어, 영어, 베트남어, 중국어 가족 안내문 템플릿입니다. 폐렴·COPD 프리셋은 vi/zh 템플릿을 별도로 선택하며, 진단명, 약물명, 용량 지시 토큰은 넣지 않습니다.

`data/legal_safety_rules.json`: 안내문과 UI 문구 검사용 정규식 8개입니다.

`data/public_sources.mock.json`: HIRA, K-OMOP, 보건복지부 통합돌봄, 장기요양 인프라, 지자체 사회복지시설 데이터의 출처·활용 방식·확보 단계를 표시합니다.

`data/review_cases.mock.json`: 담당자 업무 대기열과 B2G/B2B 사례 흐름을 보여주는 가명 사례입니다.

`docs/model-card.md`: 3-모델의 입력, 출력, 한계, 향후 평가 지표를 정리한 모델 카드입니다.

## 5. 운영 원칙

케어브릿지72는 특정 의료기관·장기요양기관을 직접 추천·알선·예약·결제하지 않습니다. 화면은 공공 담당자가 검토할 후보 정보와 위험 신호를 제공하는 데 한정됩니다.

4-Zone 통제:

- Z1 의료법 제27조: 기관 지정, 직접 연결, 예약, 결제 기능 없음
- Z2 노인장기요양보험법: 등급 판정이나 급여 결정을 수행하지 않음
- Z3 개인정보보호법: 실명, 연락처, 주민번호, 상세주소 미수집
- Z4 HIRA 데이터 절차: 현재 버전은 가명 데이터와 공개 자료만 사용하며 정식 절차 외 데이터 활용 없음

`validateLegalSafety`는 8개 정규식을 적용합니다. 위반 문구가 있으면 가족 안내문 본문을 표시하지 않고 `운영 원칙 확인 필요 - 담당자 검토 필요`로 대체합니다. `npm run check:legal`은 앱, 컴포넌트, 라이브러리, mock 데이터, 실제 렌더링 DOM, API 응답을 함께 검사합니다.

비고 입력란은 주민번호, 전화번호, 상세주소 패턴을 감지하면 값을 반영하지 않고 감사 로그에 차단 이벤트를 남깁니다.
