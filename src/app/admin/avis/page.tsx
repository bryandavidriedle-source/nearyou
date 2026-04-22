import { ReviewsPanel } from "@/components/admin/reviews-panel";
import { requireAdminScopes } from "@/lib/auth";

export default async function AdminReviewsPage() {
  await requireAdminScopes(["super_admin", "admin_review", "admin_support"]);
  return <ReviewsPanel />;
}
