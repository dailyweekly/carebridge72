# 케어브릿지72 시장 유사 서비스 검토

작성일: 2026-05-25

## 결론

케어브릿지72와 완전히 같은 국내 공개 상용 서비스는 확인되지 않았다. 유사 서비스는 존재하지만 대부분 해외 병원 중심 퇴원 자동화, post-acute referral, 환자·가족용 사후관리, 또는 국내 제도 안내·기관 검색에 가깝다. 케어브릿지72의 차별점은 국내 통합돌봄 제도 맥락에서 시군 담당자와 병원 사회사업실이 퇴원 후 72시간 내 위험 신호, 공공 후보 정보, 가족 안내문, 판단 기록을 한 화면에서 처리하도록 돕는 점이다.

## 유사 서비스 유형

| 유형 | 대표 사례 | 확인된 기능 | 케어브릿지72와의 차이 |
| --- | --- | --- | --- |
| 해외 퇴원 조정 AI | Caremaze | EMR 기반 discharge task, care team ownership, routine outreach AI | 한국 통합돌봄·HIRA/NHIS 데이터·직접 연결 제한 구조가 아님 |
| 해외 post-acute referral | Repisodic, WellSky CarePort, Aidin | post-acute provider option, referral, authorization, EHR 연동 | 미국 referral/보험/환자 선택 규정 중심이며 국내 공공 담당자 업무와 다름 |
| 환자·가족용 사후관리 | e-Cuido, AlivePost, Aescia Health | 퇴원 후 체크인, home risk, readmission monitoring | 담당자 내부 판단·문서화 화면이 아니라 환자/가족 engagement 성격 |
| 국내 공공 제도·검색 | 보건복지부 통합돌봄, NHIS 퇴원환자 지원제도, HIRA 병원정보서비스 | 제도, 기관 기준정보, 병원/요양기관 검색 | 위험 신호 산정, 후보 비교, 안내문, 인계 기록을 통합한 담당자용 업무 화면은 아님 |
| 국내 돌봄 정보 플랫폼 | 가족용 요양·돌봄 검색/상담형 서비스 | 가족 대상 요양기관·요양등급 안내 | B2C 정보 탐색에 가까우며 공공 담당자 workflow가 아님 |

## 주요 근거

보건복지부 통합돌봄 전용 누리집은 초고령화, 분절적 서비스, 불필요한 입원·입소 우려를 통합돌봄 추진 배경으로 제시하고, 2026년 3월 27일 시행되는 의료·요양 등 지역 돌봄의 통합지원 법령과 퇴원환자를 우선지원대상자에 포함한다.

보건복지부는 통합돌봄 전문기관으로 국민건강보험공단, 국민연금공단, 한국장애인개발원, 중앙사회서비스원, 시·도 사회서비스원, 한국보건복지인재원 등을 지정했고, 지자체의 조사·판정, 지원계획 수립, 지역자원 발굴, 품질관리 지원 역할을 설명한다.

건강보험심사평가원 병원정보서비스는 공공데이터포털에서 XML API로 제공되며, 요양기관 신고 기준 병원 정보를 조회할 수 있다. 케어브릿지72는 이 API를 병원 기준정보 확인용으로만 사용하고 특정 기관 추천·연결에는 사용하지 않는다.

Caremaze는 병원 discharge planning workflow, task ownership, EMR 데이터 수집, AI outreach를 제시한다. 이는 병원 내부 퇴원 지연 관리에 강하지만 국내 공공 통합돌봄 담당자용 후보 검토·문서화 구조와는 다르다.

Repisodic은 discharge automation, post-acute care option, referral automation, EHR integration, provider availability를 강조한다. 이는 미국식 post-acute referral network 성격이 강해 국내 의료법·장기요양보험·공공데이터 활용 경계와 다르다.

WellSky CarePort와 Aidin은 hospital-to-post-acute transition, referral management, provider intelligence, patient choice, authorization workflow를 제공한다. 케어브릿지72는 referral을 자동화하지 않고 담당자 검토용 후보 정보와 인계 문서 초안에 집중한다.

## 제품 포지셔닝

케어브릿지72는 "한국형 퇴원 후 72시간 통합돌봄 담당자 보조 서비스"로 포지셔닝한다.

핵심 구매자:

- 시군 통합돌봄 전담조직
- 병원 사회사업실·퇴원지원팀
- 지자체-병원 협력형 통합돌봄 파일럿 운영조직

핵심 사용자:

- 퇴원환자 초기 확인을 담당하는 공공 담당자
- 병원 내 사회사업실 또는 환자지원팀 담당자
- 통합돌봄 협력기관 실무자

차별화 문장:

> 해외 referral 자동화처럼 기관 연결을 자동화하지 않고, 국내 통합돌봄 제도 안에서 담당자가 위험 신호·후보 정보·가족 안내·인계 기록을 빠르게 검토하도록 돕는다.

## 보완 우선순위

1. 도입 검토 화면에 시장 차별점 3개를 명확히 표시한다.
2. README에 경쟁 검토 문서 링크를 추가해 평가자가 시장 이해를 바로 확인할 수 있게 한다.
3. 신청서 문구는 "추천 플랫폼"이 아니라 "담당자 검토 보조 서비스"로 통일한다.
4. 향후 실증 단계에서는 통합돌봄 담당자 3-5명의 업무 시간 단축, 문서화 누락 감소, 후보 검토 일관성 향상을 검증한다.

## 참고 URL

- 보건복지부 지역사회 통합돌봄: https://www.mohw.go.kr/menu.es?mid=a60100000000
- 보건복지부 통합돌봄 전문기관 지정: https://www.mohw.go.kr/gallery.es?act=view&bid=0003&list_no=379856&mid=a10606030000&tag=
- HIRA 병원정보서비스: https://www.data.go.kr/data/15001698/openapi.do
- Caremaze: https://www.caremaze.com/
- Repisodic: https://www.repisodic.com/
- WellSky CarePort: https://careporthealth.com/
- WellSky CarePort Transition for Epic: https://info.wellsky.com/090325-Transition-Demo.html
- Aidin: https://www.myaidin.com/
- e-Cuido: https://e-cuido.com/
