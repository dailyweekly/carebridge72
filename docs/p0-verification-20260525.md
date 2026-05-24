# P0 제출 전 검증 기록

검증일: 2026-05-25

## 완료 항목

| 항목 | 결과 |
| --- | --- |
| 구버전 표현 정리 | README와 도입 검토 화면에서 `SaaS`, `프리셋`, `감사 로그` 표현을 최신 문구로 교체 |
| Claude 모델 보강 | 기본 모델을 `claude-haiku-4-5-20251001`로 변경하고, 구모델 400/404 응답 시 최신 Haiku로 재시도 |
| fallback 문구 정리 | AI 기본 초안에서도 `HIGH 78점` 대신 `높음 78점`으로 표시 |
| 최신 캡처 생성 | `npm run capture`로 `captures/01-input.png`~`captures/07-hospital-reference.png` 재생성 |
| 로컬 검증 | `npm run test`, `npm run check:legal`, `npm run build` 통과 |
| 배포 검증 | `https://carebridge72.vercel.app` 기준 workspace 접근 코드, Claude 초안 생성, NHIS 후보 조회 확인 |

## 배포 API 확인

| API | 결과 |
| --- | --- |
| `/api/health` | `status=ok`, `llm=claude-enabled`, `publicApi=enabled-with-fallback` |
| `/api/workspace/access` | 접근 코드 `7272`로 `200 OK` |
| `/api/llm/draft` | `source=claude`, `model=claude-haiku-4-5-20251001` |
| `/api/resources` | `source=nhis-live-with-mock-fallback`, 후보 5건 반환 |
| `/api/hospitals` | 수원 조건 기준 `source=empty`, 0건 반환. 병원 기준정보 없음 상태로 화면 흐름 유지 |

## 제출 반영 메모

- 첨부5 캡처는 반드시 최신 `captures` 폴더 이미지로 교체한다.
- 신청서에는 `AI 생성`을 Claude Haiku 기반 초안 생성으로 표현한다.
- `HIRA 병원정보서비스`는 병원 기준정보 확인용이며, 특정 병원 추천이나 연결 용도로 쓰지 않는다고 명시한다.
- `HIRA 맞춤형/K-OMOP 데이터`는 신청 완료 후 수령 대기 상태로 쓰고, 학습 완료처럼 표현하지 않는다.
