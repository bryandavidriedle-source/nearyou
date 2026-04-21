import { getCatalogueData } from "@/lib/db";
import { pageMetadata } from "@/lib/site";

import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";

export const metadata: Metadata = pageMetadata({
  title: "NEARYOU Catalogue",
  description: "Large task catalogue with categories, subcategories, tags and free request.",
  path: "/catalogue",
});

export default async function CataloguePage() {
  const lang = await getCurrentLanguage();
  const m = messages[lang];
  const categories = await getCatalogueData();

  return (
    <section className="py-12">
      <Container className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{m.catalogue.title}</h1>
          <p className="mt-2 text-slate-600">{m.catalogue.subtitle}</p>
        </div>

        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="rounded-2xl border-slate-200 bg-white p-5">
              <h2 className="text-xl font-semibold text-slate-900">{category.name}</h2>
              <p className="text-sm text-slate-600">{m.catalogue.from} {category.fromPrice} CHF</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {category.subcategories.map((sub) => (
                  <div key={sub.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-800">{sub.name}</h3>
                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                      {sub.tasks.map((task) => (
                        <li key={task.id}>
                          <p>{task.title} <span className="text-xs uppercase text-blue-700">{task.mode}</span></p>
                          <p className="text-xs text-slate-500">{m.catalogue.tags}: {task.tags.map((tag: { tag: { name: string } }) => tag.tag.name).join(", ")}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl border-green-100 bg-green-50 p-5">
          <h2 className="text-xl font-semibold text-green-800">{m.catalogue.cannotFind}</h2>
          <p className="mt-1 text-sm text-green-700">{m.catalogue.cannotFindText}</p>
          <Button className="mt-4 rounded-xl bg-green-600 hover:bg-green-700">{m.catalogue.freeRequest}</Button>
        </Card>
      </Container>
    </section>
  );
}





