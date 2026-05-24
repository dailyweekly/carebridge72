import patients from "@/data/patients.mock.json";
import resources from "@/data/care_resources.mock.json";
import { WorkspaceClient } from "@/components/WorkspaceClient";
import type { CareResource, Language, Patient } from "@/lib/types";

type WorkspacePageProps = {
  searchParams?: Promise<{
    patient?: string;
    lang?: string;
  }>;
};

const languages: Language[] = ["ko", "en", "vi", "zh"];

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const resolvedSearchParams = await searchParams;
  const lang = languages.includes(resolvedSearchParams?.lang as Language)
    ? (resolvedSearchParams?.lang as Language)
    : undefined;

  return (
    <WorkspaceClient
      initialPatients={patients as Patient[]}
      resources={resources as CareResource[]}
      initialPatientId={resolvedSearchParams?.patient}
      initialLanguage={lang}
    />
  );
}
