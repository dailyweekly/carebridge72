import { regionLabels } from "./labels";
import type { Patient } from "./types";

type FetchLike = typeof fetch;

export type HospitalReference = {
  id: string;
  name: string;
  regionLabel: string;
  className: string;
  district: string;
  addressSummary: string;
  source: "HIRA_HOSPITAL_INFO";
  useLimit: string;
};

const defaultEndpoint = "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";

export async function fetchHiraHospitalReferences(
  patient: Pick<Patient, "region">,
  options: { env?: Record<string, string | undefined>; fetcher?: FetchLike } = {}
): Promise<HospitalReference[]> {
  const env = options.env ?? process.env;
  const serviceKey = env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey) return [];

  const endpoint = env.HIRA_HOSP_API_URL || defaultEndpoint;
  const fetcher = options.fetcher ?? fetch;
  const url = new URL(endpoint);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "100");
  url.searchParams.set("sidoCd", "310000");

  try {
    const response = await fetcher(url);
    if (!response.ok) return [];
    const xml = await response.text();
    return parseHiraHospitalXml(xml, patient.region);
  } catch {
    return [];
  }
}

export function parseHiraHospitalXml(xml: string, region: Patient["region"]): HospitalReference[] {
  const regionText = regionLabels[region].replace("시", "");
  return extractItems(xml)
    .map((item, index) => toHospitalReference(item, region, index))
    .filter((item): item is HospitalReference => Boolean(item))
    .filter((item) => item.district.includes(regionText) || item.addressSummary.includes(regionText))
    .slice(0, 10);
}

function toHospitalReference(itemXml: string, region: Patient["region"], index: number): HospitalReference | null {
  const name = firstTag(itemXml, ["yadmNm"]);
  if (!name) return null;
  const address = firstTag(itemXml, ["addr"]);
  return {
    id: `HIRA-HOSP-${region}-${String(index + 1).padStart(2, "0")}`,
    name,
    regionLabel: regionLabels[region],
    className: firstTag(itemXml, ["clCdNm"]) || "종별 확인 필요",
    district: firstTag(itemXml, ["sgguCdNm"]) || "시군구 확인 필요",
    addressSummary: summarizeAddress(address),
    source: "HIRA_HOSPITAL_INFO",
    useLimit: "병원 사회사업실 PoC 기준정보로만 사용하며 환자 대상 기관 지정에는 사용하지 않음"
  };
}

function extractItems(xml: string) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
}

function firstTag(xml: string, tags: string[]) {
  for (const tag of tags) {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
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

function summarizeAddress(address: string) {
  return address.split(",")[0]?.trim() || "주소 확인 필요";
}
