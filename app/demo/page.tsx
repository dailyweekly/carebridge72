import patients from "@/data/patients.mock.json";
import resources from "@/data/care_resources.mock.json";
import sources from "@/data/public_sources.mock.json";
import cases from "@/data/review_cases.mock.json";
import { DemoDashboard } from "@/components/DemoDashboard";
import type { CareResource, Patient, PublicDataSource, ReviewCase } from "@/lib/types";

export default function DemoPage() {
  return (
    <DemoDashboard
      initialPatients={patients as Patient[]}
      resources={resources as CareResource[]}
      sources={sources as PublicDataSource[]}
      cases={cases as ReviewCase[]}
      captureMode={false}
    />
  );
}
