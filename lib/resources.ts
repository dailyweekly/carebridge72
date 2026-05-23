import type { CareResource, Patient, ResourceMatch } from "./types";
import { regionLabels } from "./labels";

export function matchCareResources(
  patient: Pick<Patient, "region">,
  resources: CareResource[]
): ResourceMatch {
  const sameRegion = resources
    .filter((resource) => resource.region === patient.region)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const selected: CareResource[] = [];
  const usedCategories = new Set<CareResource["category"]>();

  for (const resource of sameRegion) {
    if (!usedCategories.has(resource.category)) {
      selected.push(resource);
      usedCategories.add(resource.category);
    }
    if (selected.length === 5) break;
  }

  for (const resource of sameRegion) {
    if (selected.length >= 3) break;
    if (!selected.some((item) => item.id === resource.id)) {
      selected.push(resource);
    }
  }

  return {
    candidates: selected.slice(0, 5),
    rationale: `${regionLabels[patient.region]} 지역 코드 일치 항목에서 카테고리 다양성과 가공 거리 정보를 기준으로 3~5개 후보 정보를 표시합니다.`
  };
}
