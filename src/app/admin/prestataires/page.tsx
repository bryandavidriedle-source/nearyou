import { ProvidersApplicationsPanel } from "@/components/admin/providers-applications-panel";
import { requireAdminScopes } from "@/lib/auth";

export default async function AdminProvidersPage() {
  await requireAdminScopes(["super_admin", "admin_review", "admin_ops"]);
  return <ProvidersApplicationsPanel />;
}
