import { describe, expect, it } from "vitest";
import { fetchHiraHospitalLookup, fetchHiraHospitalReferences, parseHiraHospitalXml } from "@/lib/hira-hospital";

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

  it("distinguishes unconfigured, connected-empty, and live HIRA states", async () => {
    const unconfigured = await fetchHiraHospitalLookup(
      { region: "GG-SUWON" },
      { env: {}, fetcher: (() => Promise.reject(new Error("should not call"))) as typeof fetch }
    );
    const connectedEmpty = await fetchHiraHospitalLookup(
      { region: "GG-SUWON" },
      {
        env: { DATA_GO_KR_SERVICE_KEY: "key" },
        fetcher: (() => Promise.resolve(new Response("<response><body><items /></body></response>"))) as typeof fetch
      }
    );
    const live = await fetchHiraHospitalLookup(
      { region: "GG-SUWON" },
      {
        env: { DATA_GO_KR_SERVICE_KEY: "key" },
        fetcher: (() =>
          Promise.resolve(
            new Response(`
              <response><body><items><item>
                <addr>경기도 수원시 팔달구 중부대로 93</addr>
                <clCdNm>상급종합</clCdNm>
                <sgguCdNm>수원팔달구</sgguCdNm>
                <yadmNm>테스트병원</yadmNm>
              </item></items></body></response>
            `)
          )) as typeof fetch
      }
    );

    expect(unconfigured.source).toBe("unconfigured");
    expect(connectedEmpty.source).toBe("hira-live-empty");
    expect(live.source).toBe("hira-live");
    expect(live.references).toHaveLength(1);
  });

  it("reports authorization failures separately from network failures", async () => {
    const unauthorized = await fetchHiraHospitalLookup(
      { region: "GG-SUWON" },
      {
        env: { DATA_GO_KR_SERVICE_KEY: "bad-key" },
        fetcher: (() => Promise.resolve(new Response("Unauthorized", { status: 401 }))) as typeof fetch
      }
    );
    const networkFailed = await fetchHiraHospitalLookup(
      { region: "GG-SUWON" },
      {
        env: { DATA_GO_KR_SERVICE_KEY: "key" },
        fetcher: (() => Promise.resolve(new Response("Gateway timeout", { status: 504 }))) as typeof fetch
      }
    );

    expect(unauthorized.source).toBe("authorization-failed");
    expect(unauthorized.statusCode).toBe(401);
    expect(networkFailed.source).toBe("request-failed");
    expect(networkFailed.statusCode).toBe(504);
  });
});
