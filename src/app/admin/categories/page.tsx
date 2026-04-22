import { CategoriesPanel } from "@/components/admin/categories-panel";
import { requireAdminScopes } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdminScopes(["super_admin", "admin_ops"]);
  return <CategoriesPanel />;
}
