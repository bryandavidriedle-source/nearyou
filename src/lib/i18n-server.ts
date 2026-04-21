import { cookies } from "next/headers";

import { normalizeLanguage, type Language } from "@/lib/i18n";

export async function getCurrentLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  return normalizeLanguage(lang);
}
