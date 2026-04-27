import type { Metadata } from "next";

import { HotlineForm } from "@/components/nearyou/hotline-form";
import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { pageMetadata, siteConfig } from "@/lib/site";
import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";

export const metadata: Metadata = pageMetadata({
  title: "Rappel téléphonique | PrèsDeToi",
  description: "Assistance téléphonique PrèsDeToi pour réserver simplement avec accompagnement humain.",
  path: "/hotline",
});

export default async function HotlinePage() {
  const lang = await getCurrentLanguage();
  const m = messages[lang];

  return (
    <section className="py-12">
      <Container className="max-w-4xl space-y-6">
        <Card className="rounded-2xl border-blue-100 bg-blue-50 p-5">
          <h1 className="text-2xl font-semibold text-blue-900">{m.hotline.title}</h1>
          <p className="mt-1 text-sm text-blue-700">{m.hotline.subtitle.replace("+41 21 555 00 00", siteConfig.phone)}</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border-slate-200 bg-white p-4 text-sm text-slate-600">{m.hotline.step1}</Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4 text-sm text-slate-600">{m.hotline.step2}</Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4 text-sm text-slate-600">{m.hotline.step3}</Card>
        </div>

        <HotlineForm lang={lang} />
      </Container>

      <div className="fixed inset-x-0 bottom-20 z-40 px-4 md:hidden">
        <a
          href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
          className="block rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg hover:bg-green-700"
        >
          Appeler {siteConfig.phone}
        </a>
      </div>
    </section>
  );
}





