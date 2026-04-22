"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type UserMenuItem = {
  href: string;
  label: string;
};

type UserMenuProps = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  statusLabel: string;
  items: UserMenuItem[];
};

function initials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const first = firstName?.trim()?.[0] ?? "";
  const last = lastName?.trim()?.[0] ?? "";
  const combined = `${first}${last}`.trim();
  if (combined.length >= 1) return combined.toUpperCase();
  if (email?.trim()?.[0]) return email.trim()[0].toUpperCase();
  return "N";
}

export function UserMenu({ firstName, lastName, email, avatarUrl, statusLabel, items }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const userInitials = useMemo(() => initials(firstName, lastName, email), [email, firstName, lastName]);
  const displayName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || email || "Utilisateur";

  async function signOut() {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
            {userInitials}
          </span>
        )}
        <span className="hidden text-xs font-semibold text-slate-700 sm:inline-flex">{statusLabel}</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">{email ?? ""}</p>
          </div>

          <div className="mt-2 space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {loading ? "Déconnexion..." : "Déconnexion"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
