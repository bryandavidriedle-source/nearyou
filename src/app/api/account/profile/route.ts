import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { getAuthContext } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const profilePatchSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(30).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(120),
});

export async function GET() {
  const auth = await getAuthContext();
  if (!auth.user) return jsonError("Connexion requise.", 401);

  return Response.json({
    success: true,
    data: {
      firstName: auth.profile?.first_name ?? "",
      lastName: auth.profile?.last_name ?? "",
      phone: auth.profile?.phone ?? "",
      city: auth.profile?.city ?? "",
      role: auth.role,
    },
  });
}

export async function PATCH(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await getAuthContext();
  if (!auth.user) return jsonError("Connexion requise.", 401);

  const body = await request.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Profil invalide.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone || null,
      city: parsed.data.city,
    })
    .eq("id", auth.user.id);

  if (error) return jsonError("Impossible de mettre a jour le profil.", 500);
  return jsonSuccess("Profil mis a jour.");
}
