import { regionLabels } from "./labels";
import { getCached, setCached } from "./server-cache";
import type { Patient } from "./types";

type FetchLike = typeof fetch;
const cacheTtlMs = 30 * 60 * 1000;
const requestTimeoutMs = 12000;
export type HiraHospitalSource =
  | "hira-live"
  | "hira-live-empty"
  | "unconfigured"
  | "authorization-failed"
  | "request-failed";

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

export type HiraHospitalLookup = {
  source: HiraHospitalSource;
  references: HospitalReference[];
  statusCode?: number;
};

const defaultEndpoint = "https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList";

export async function fetchHiraHospitalReferences(
  patient: Pick<Patient, "region">,
  options: { env?: Record<string, string | undefined>; fetcher?: FetchLike } = {}
): Promise<HospitalReference[]> {
  const lookup = await fetchHiraHospitalLookup(patient, options);
  return lookup.references;
}

export async function fetchHiraHospitalLookup(
  patient: Pick<Patient, "region">,
  options: { env?: Record<string, string | undefined>; fetcher?: FetchLike } = {}
): Promise<HiraHospitalLookup> {
  const env = options.env ?? process.env;
  const serviceKey = env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey) return { source: "unconfigured", references: [] };

  const endpoint = env.HIRA_HOSP_API_URL || defaultEndpoint;
  const fetcher = options.fetcher;
  const url = new URL(endpoint);
  url.searchParams.set("ServiceKey", serviceKey);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "100");
  url.searchParams.set("sidoCd", "310000");

  try {
    let result = await fetchXml(url, fetcher);
    if (!fetcher && result.statusCode === 0 && url.protocol === "https:") {
      const httpUrl = new URL(url.toString());
      httpUrl.protocol = "http:";
      result = await fetchXml(httpUrl, fetcher);
    }
    if (!result.ok) {
      return {
        source: result.statusCode === 401 || result.statusCode === 403 ? "authorization-failed" : "request-failed",
        references: [],
        statusCode: result.statusCode
      };
    }
    const xml = result.text;
    const references = parseHiraHospitalXml(xml, patient.region);
    return {
      source: references.length > 0 ? "hira-live" : "hira-live-empty",
      references,
      statusCode: result.statusCode
    };
  } catch {
    return { source: "request-failed", references: [] };
  }
}

async function fetchXml(url: URL, fetcher?: FetchLike) {
  if (fetcher) {
    const response = await fetcher(url);
    return {
      ok: response.ok,
      statusCode: response.status,
      text: response.ok ? await response.text() : ""
    };
  }

  const cacheKey = `hira-hospital:${url.toString()}`;
  const cached = getCached<{ ok: boolean; statusCode: number; text: string }>(cacheKey);
  if (cached !== null) return cached;

  const result = await fetchText(url, requestTimeoutMs);
  if (result.ok && result.text) setCached(cacheKey, result, cacheTtlMs);
  return result;
}

async function fetchText(url: URL, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return {
      ok: response.ok,
      statusCode: response.status,
      text: response.ok ? await response.text() : ""
    };
  } catch {
    return {
      ok: false,
      statusCode: 0,
      text: ""
    };
  } finally {
    clearTimeout(timeout);
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
