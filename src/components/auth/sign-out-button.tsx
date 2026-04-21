"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSignOut() {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" className="rounded-xl border-slate-300" onClick={onSignOut} disabled={loading}>
      {loading ? "Déconnexion..." : "Se déconnecter"}
    </Button>
  );
}

