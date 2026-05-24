import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const captureDir = path.join(root, "captures");
const minPngBytes = 20_000;

const expectedCaptures = [
  ["01-input.png", "첫 화면, 사례 선택, 위험 신호 요약"],
  ["02-risk.png", "재입원 위험 신호, 점수 근거, 시연 기준시각"],
  ["03-candidates.png", "지역 돌봄 자원 후보와 출처 구분"],
  ["04-guide.png", "가족 안내문과 운영 원칙 확인"],
  ["05-full.png", "별첨5용 전체 요약 화면"],
  ["06-workspace.png", "AI 작업 화면, 접근 코드 후 초안 생성 흐름"],
  ["07-hospital-reference.png", "HIRA 병원정보서비스 공공데이터 기준정보"],
  ["08-mobile.png", "모바일 첫 화면 가독성"],
  ["09-status.png", "운영 상태, 연동 준비도, 운영 통제"]
];

const errors = [];

for (const [file, purpose] of expectedCaptures) {
  const filePath = path.join(captureDir, file);
  if (!fs.existsSync(filePath)) {
    errors.push(`${file}: missing`);
    continue;
  }

  const stat = fs.statSync(filePath);
  if (stat.size < minPngBytes) {
    errors.push(`${file}: too small (${stat.size} bytes)`);
  }
  console.log(`- ${file} (${stat.size} bytes): ${purpose}`);
}

if (errors.length > 0) {
  console.error("Capture check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Capture check passed (${expectedCaptures.length} files).`);
