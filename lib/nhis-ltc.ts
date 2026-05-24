import { categoryLabels, regionLabels } from "./labels";
import { fetchTextWithTimeout, getCached, setCached } from "./server-cache";
import type { CareResource, Patient } from "./types";

type FetchLike = typeof fetch;
const cacheTtlMs = 10 * 60 * 1000;
const requestTimeoutMs = 4000;

const defaultEndpoint = "https://apis.data.go.kr/B550928/searchLtcInsttService02/getLtcInsttSeachList02";

const regionSggCodes: Record<Patient["region"], string[]> = {
  "GG-SUWON": ["111", "113", "115", "117"],
  "GG-GOYANG": ["281", "285", "287"],
  "GG-SEONGNAM": ["131", "133", "135"],
  "GG-ANSAN": ["271", "273"]
};

export async function fetchNhisLongTermCareResources(
  patient: Pick<Patient, "region">,
  options: { env?: Record<string, string | undefined>; fetcher?: FetchLike } = {}
): Promise<CareResource[]> {
  const env = options.env ?? process.env;
  const serviceKey = env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey) return [];

  const endpoint = env.NHIS_LTC_API_URL || defaultEndpoint;
  const fetcher = options.fetcher;

  try {
    const responses = await Promise.all(
      regionSggCodes[patient.region].map(async (siGunGuCd) => {
        const url = new URL(endpoint);
        url.searchParams.set("serviceKey", serviceKey);
        url.searchParams.set("pageNo", "1");
        url.searchParams.set("numOfRows", "15");
        url.searchParams.set("siDoCd", "41");
        url.searchParams.set("siGunGuCd", siGunGuCd);
        return fetchXml(url, fetcher);
      })
    );
    return responses.flatMap((xml) => parseNhisLtcXml(xml, patient.region)).slice(0, 20);
  } catch {
    return [];
  }
}

async function fetchXml(url: URL, fetcher?: FetchLike) {
  if (fetcher) {
    const response = await fetcher(url);
    if (!response.ok) return "";
    return response.text();
  }

  const cacheKey = `nhis-ltc:${url.toString()}`;
  const cached = getCached<string>(cacheKey);
  if (cached !== null) return cached;

  const xml = await fetchTextWithTimeout(url, requestTimeoutMs);
  if (xml) setCached(cacheKey, xml, cacheTtlMs);
  return xml;
}

export function parseNhisLtcXml(xml: string, region: Patient["region"]): CareResource[] {
  return extractItems(xml)
    .map((item, index) => toCareResource(item, region, index))
    .filter((item): item is CareResource => Boolean(item))
    .slice(0, 10);
}

function toCareResource(itemXml: string, region: Patient["region"], index: number): CareResource | null {
  const name = firstTag(itemXml, ["adminNm", "ltcInsttNm", "insttNm", "longTermAdminNm", "기관명"]);
  if (!name) return null;
  const rawType = firstTag(itemXml, ["adminPttnCdNm", "ltcInsttPttnNm", "serviceType", "급여종류", "adminPttnCd"]) || "";
  const category = inferCategory(`${name} ${rawType}`);
  const regionLabel = regionLabels[region];

  return {
    id: `NHIS-LTC-${region}-${String(index + 1).padStart(2, "0")}`,
    region,
    regionLabel,
    name: `${regionLabel} ${categoryLabels[category]} 후보 ${index + 1}`,
    category,
    distanceKm: 2 + index * 0.6,
    publicContact: "시군 통합돌봄 전담창구",
    operatingWindow: "기관 운영정보 확인 필요",
    notes: `NHIS 장기요양기관 검색 서비스 원천명: ${stripDirectContact(name)}. 담당자 검토 후 후보 여부 확인`
  };
}

function inferCategory(text: string): CareResource["category"] {
  if (/방문\s*간호|간호/i.test(text)) return "VISITING_NURSING";
  if (/주야간|주·야간|주간|야간/i.test(text)) return "DAY_CARE";
  if (/방문\s*요양|재가|요양/i.test(text)) return "HOME_CARE";
  return "HOME_CARE";
}

function extractItems(xml: string) {
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
  if (itemMatches.length > 0) return itemMatches;
  return [...xml.matchAll(/<items?>([\s\S]*?)<\/items?>/g)].map((match) => match[1]);
}

function firstTag(xml: string, tags: string[]) {
  for (const tag of tags) {
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = xml.match(new RegExp(`<${escaped}>([\\s\\S]*?)<\\/${escaped}>`));
    if (match?.[1]) return decodeXml(match[1].trim());
  }
  return "";
}

function decodeXml(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripDirectContact(text: string) {
  return text.replace(/\d{2,4}-\d{3,4}-\d{4}/g, "연락처 비표시");
}
