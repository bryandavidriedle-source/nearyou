import { createClient } from "@supabase/supabase-js";

import { publicEnv, requireServerSecret, serverEnv } from "@/lib/env";

export function getSupabaseAdminClient() {
  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    requireServerSecret(serverEnv.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
