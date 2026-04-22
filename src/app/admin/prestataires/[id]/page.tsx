import { ProviderApplicationDetailPanel } from "@/components/admin/provider-application-detail-panel";
import { requireAdminScopes } from "@/lib/auth";

export default async function AdminProviderDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  await requireAdminScopes(["super_admin", "admin_review", "admin_ops"]);
  const { id } = await props.params;
  return <ProviderApplicationDetailPanel applicationId={id} />;
}
