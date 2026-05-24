# 제출 캡처 매니페스트

작성일: 2026-05-25

이 문서는 신청서 별첨5에 넣을 캡처의 용도를 정리한 목록이다. `captures/` 폴더는 GitHub에 올리지 않으며, 제출 문서 작성 시 로컬 파일을 사용한다.

## 권장 첨부 순서

| 순서 | 파일 | 증빙 내용 | 신청서 위치 |
| --- | --- | --- | --- |
| 1 | `captures/01-input.png` | 첫 화면, 사례 선택, 72시간 사례 검토 시작 흐름 | 별첨5 첫 장 |
| 2 | `captures/02-risk.png` | 위험 신호, 점수 근거, 시연 기준시각, 모델 버전 | 별첨5 또는 사업계획서 완성도 |
| 3 | `captures/03-candidates.png` | 지역 돌봄 자원 후보, 후보 출처 구분, 담당자 검토 상태 | 공공데이터 활용 설명 |
| 4 | `captures/04-guide.png` | 가족 안내문, 다국어 안내, 운영 원칙 확인 | AI 활용 및 서비스 흐름 |
| 5 | `captures/05-full.png` | 별첨5용 전체 요약 화면 | 별첨5 대표 이미지 |
| 6 | `captures/06-workspace.png` | 접근 코드 후 AI 작업 화면, 인계 요약·가족 안내 초안 생성 흐름 | AI 플랫폼 증빙 |
| 7 | `captures/07-hospital-reference.png` | HIRA 병원정보서비스 공공데이터 기준정보 반영 | 공공데이터 연결성 증빙 |
| 8 | `captures/08-mobile.png` | 모바일 첫 화면 가독성과 반응형 구성 | 사용자 이용성 보강 |
| 9 | `captures/09-status.png` | 배포·연동·운영 통제 상태 | 전문성·운영 준비도 |

## 자동 확인

```bash
npm run capture
npm run check:captures
```

Vercel 실배포 화면 기준으로 다시 만들 때는 다음 명령을 사용한다.

```powershell
$env:CAPTURE_BASE_URL='https://carebridge72.vercel.app'; npm run capture
npm run check:captures
```

## 제출 시 주의

- 캡처에 실명, 연락처, 주민번호, 상세주소가 들어가지 않았는지 확인한다.
- HIRA 병원정보서비스 화면은 병원 기준정보 확인용이며, 특정 병원 추천이나 연결 근거로 설명하지 않는다.
- `09-status.png`는 기술 운영 상태를 보기 위한 보조 증빙으로 사용하고, 사용자 업무 화면의 핵심 설명은 `01`~`07`을 중심으로 구성한다.
