import { RequestsPanel } from "@/components/admin/requests-panel";
import { requireAdminScopes } from "@/lib/auth";

export default async function AdminRequestsPage() {
  const auth = await requireAdminScopes(["super_admin", "admin_ops", "admin_support", "admin_review"]);
  return <RequestsPanel adminScope={auth.adminScope!} />;
}
