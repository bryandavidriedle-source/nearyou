import { AdminsPanel } from "@/components/admin/admins-panel";
import { requireAdminScopes } from "@/lib/auth";

export default async function AdminAdminsPage() {
  await requireAdminScopes(["super_admin"]);
  return <AdminsPanel />;
}
