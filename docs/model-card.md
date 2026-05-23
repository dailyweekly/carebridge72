# CareBridge72 Model Card

## Scope

케어브릿지72 MVP는 실제 임상 판단 모델이 아니라, 사업계획서의 3-모델 구조를 재현하는 담당자 보조형 시제품이다. 모든 입력은 가명 mock data이며 외부 의료 API를 호출하지 않는다.

## Model 1: 재입원 위험분류

- Input: 나이, 퇴원일, 진단군, 동반질환, 지역, 생활환경, 돌봄자 유무, 언어, 비고
- Output: 0~100 점수, LOW/MEDIUM/HIGH 밴드, 근거 3개, 규칙 가중치
- MVP method: 해석 가능 규칙 기반 XGBoost surrogate
- Future data: HIRA 맞춤형 연구분석, K-OMOP CDM, 시군 시범사업 데이터
- Future metrics: AUC, recall@HIGH, calibration, 담당자 수용률

## Model 2: 지역 돌봄 자원 후보 매칭

- Input: 지역 코드, 위험 밴드, 돌봄자 유무
- Output: 카테고리 다양성 기준 3~5개 후보 카드
- MVP method: 지역 코드 일치, 카테고리 다양성, 가공 거리 정렬
- Safety: 자연어 생성 없음, 특정 기관 지정·예약·결제 없음

## Model 3: 다국어 가족 안내 생성

- Input: 환자 가명 ID, 위험 결과, 후보 수, 언어 코드
- Output: 한국어 + 외국어 안내문
- MVP method: 공공 안내문 템플릿과 표준 문구 치환
- Safety: 진단·약물·용량 지시 없음, 출력 전 정규식 8개 검사

## Known Limits

- MVP 점수는 실제 재입원 확률이 아니다.
- 기관명은 가명이며 실제 연결 기능이 없다.
- 가족 안내문은 담당자가 검토한 뒤 전달하는 간접 수령 구조다.
