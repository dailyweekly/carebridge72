# 케어브릿지72 제출 직전 체크리스트

작성일: 2026-05-24

## 1. 신청서 본문

- 첨부1 참가신청서가 PDF에 2회 반복되어 있으면 1부만 남깁니다.
- 작성일은 실제 제출일 기준으로 맞춥니다. 2026-05-24 제출이면 `2026년 05월 24일`, 2026-05-25 제출이면 `2026년 05월 25일`입니다.
- `안전선`은 `운영 원칙`, `담당자 보조형 구조`, `출력 전 검토`로 바꿉니다.
- `정책 KPI 대시보드`, `Role-based 모드`, `분기 정책 리포트 자동 생성`은 현재 사용자 화면 설명에서 제외합니다.
- `소형 LLM + RAG`는 `Claude Haiku 기반 문서 초안 생성 + 공공 안내문 템플릿 + 운영 원칙 검사`로 바꿉니다.
- HIRA 맞춤형/K-OMOP 데이터는 `신청 완료 후 수령 대기`로 쓰고, 현재 MVP 연동 항목은 NHIS 장기요양기관 검색 서비스와 HIRA 병원정보서비스 공개 API로 구분합니다.

## 2. 첨부5 캡처 순서와 캡션

| 순서 | 파일 | 캡션 |
| --- | --- | --- |
| 1 | `captures/01-input.png` | 가명 환자 프리셋과 생활환경 입력 화면 |
| 2 | `captures/02-risk.png` | 퇴원 후 72시간 재입원 위험 신호와 근거 확인 화면 |
| 3 | `captures/03-candidates.png` | 거주지 기반 지역 돌봄 자원 후보 확인 화면 |
| 4 | `captures/04-guide.png` | 가족 안내문 생성 및 운영 원칙 확인 화면 |
| 5 | `captures/05-full.png` | 사례 검토 전체 흐름 화면 |
| 6 | `captures/06-workspace.png` | 접근 코드 입력 후 사용하는 AI 작업 화면 |
| 7 | `captures/07-hospital-reference.png` | 병원 사회사업실 기준정보 확인 화면 |

## 3. 첨부5에서 제외할 캡처

- `captures/07-data-panels.png`
- `captures/workspace-data-panels-local.png`
- `captures/workspace-integrations-local.png`
- `captures/debug-workspace-entry.png`
- `captures/ux-home-desktop.png`
- `captures/ux-home-mobile.png`
- `captures/ux-workspace-desktop.png`
- `captures/ux-workspace-mobile.png`

## 4. 제출 전 확인

- Vercel URL: `https://carebridge72.vercel.app`
- AI 작업 화면: `https://carebridge72.vercel.app/workspace`
- 접근 코드: `7272`
- GitHub 저장소에는 PDF, DOCX, API 키, 개인정보 파일이 포함되지 않아야 합니다.
- Vercel 환경변수에는 `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `WORKSPACE_ACCESS_CODE`, `DATA_GO_KR_SERVICE_KEY`가 설정되어 있어야 합니다.

