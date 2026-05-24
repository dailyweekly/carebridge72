import { describe, expect, it } from "vitest";
import { fetchHiraHospitalReferences, parseHiraHospitalXml } from "@/lib/hira-hospital";

describe("HIRA hospital info integration", () => {
  it("normalizes HIRA hospital XML for reference use only", () => {
    const xml = `
      <response><body><items>
        <item>
          <addr>경기도 수원시 팔달구 중부대로 93, (지동)</addr>
          <clCdNm>상급종합</clCdNm>
          <sgguCdNm>수원팔달구</sgguCdNm>
          <telno>031-1577-8588</telno>
          <hospUrl>https://example.test</hospUrl>
          <yadmNm>가톨릭대학교 성빈센트병원</yadmNm>
        </item>
      </items></body></response>
    `;
    const references = parseHiraHospitalXml(xml, "GG-SUWON");

    expect(references).toHaveLength(1);
    expect(references[0].className).toBe("상급종합");
    expect(references[0].useLimit).toContain("기준정보");
    expect(JSON.stringify(references)).not.toContain("031-1577-8588");
    expect(JSON.stringify(references)).not.toContain("https://example.test");
  });

  it("returns an empty list when service key is missing", async () => {
    const references = await fetchHiraHospitalReferences(
      { region: "GG-SUWON" },
      { env: {}, fetcher: (() => Promise.reject(new Error("should not call"))) as typeof fetch }
    );

    expect(references).toEqual([]);
  });
});
