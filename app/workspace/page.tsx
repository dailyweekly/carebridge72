import patients from "@/data/patients.mock.json";
import resources from "@/data/care_resources.mock.json";
import { WorkspaceClient } from "@/components/WorkspaceClient";
import type { CareResource, Patient } from "@/lib/types";

export default function WorkspacePage() {
  return <WorkspaceClient initialPatients={patients as Patient[]} resources={resources as CareResource[]} />;
}
