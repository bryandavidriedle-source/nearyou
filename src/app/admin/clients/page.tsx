import { ClientsPanel } from "@/components/admin/clients-panel";
import { requireAdminScopes } from "@/lib/auth";

export default async function AdminClientsPage() {
  await requireAdminScopes(["super_admin", "admin_ops", "admin_support"]);
  return <ClientsPanel />;
}
