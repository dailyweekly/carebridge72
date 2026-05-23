const privacyPatterns = [
  { name: "주민등록번호", regexp: /[0-9]{6}[-]?[1-4][0-9]{6}/g },
  { name: "전화번호", regexp: /[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/g },
  { name: "상세주소", regexp: /(로|길)\s?[0-9]{1,4}(-[0-9]{1,4})?/g }
];

export function detectPrivacyRisk(text: string) {
  return privacyPatterns.flatMap((pattern) => {
    const matches = [...text.matchAll(pattern.regexp)];
    return matches.map((match) => ({
      type: pattern.name,
      snippet: match[0]
    }));
  });
}
