import { describe, expect, it } from "vitest";
import { fetchNhisLongTermCareResources, parseNhisLtcXml } from "@/lib/nhis-ltc";

describe("NHIS long-term care integration", () => {
  it("normalizes NHIS XML without exposing direct contact information", () => {
    const xml = `
      <response><body><items>
        <item><adminNm>수원방문간호센터 031-111-2222</adminNm><adminPttnCdNm>방문간호</adminPttnCdNm></item>
        <item><adminNm>수원재가요양센터</adminNm><adminPttnCdNm>방문요양</adminPttnCdNm></item>
      </items></body></response>
    `;
    const resources = parseNhisLtcXml(xml, "GG-SUWON");

    expect(resources).toHaveLength(2);
    expect(resources[0].category).toBe("VISITING_NURSING");
    expect(resources[1].category).toBe("HOME_CARE");
    expect(JSON.stringify(resources)).not.toContain("031-111-2222");
    expect(JSON.stringify(resources)).not.toMatch(/추천|예약|연결/);
  });

  it("returns an empty list when service key is missing", async () => {
    const resources = await fetchNhisLongTermCareResources(
      { region: "GG-SUWON" },
      { env: {}, fetcher: (() => Promise.reject(new Error("should not call"))) as typeof fetch }
    );

    expect(resources).toEqual([]);
  });
});
