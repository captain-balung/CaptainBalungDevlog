import { ProjectForm } from "@/components/ProjectForm";
import { createProjectAction } from "../../_actions/projects";

export const metadata = { title: "新計畫 · 後台" };

type SearchParams = Promise<{ error?: string; msg?: string }>;

export default async function NewProjectPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, msg } = await searchParams;
  return (
    <>
      <h1 className="admin-h1">新計畫</h1>
      <ProjectForm
        action={createProjectAction}
        submitLabel="建立"
        error={error ? { code: error, msg } : undefined}
      />
    </>
  );
}
