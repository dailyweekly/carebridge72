import patients from "@/data/patients.mock.json";
import resources from "@/data/care_resources.mock.json";
import { DemoDashboard } from "@/components/DemoDashboard";
import type { CareResource, Patient } from "@/lib/types";

export default function CapturePage() {
  return (
    <DemoDashboard
      initialPatients={patients as Patient[]}
      resources={resources as CareResource[]}
      captureMode
    />
  );
}
