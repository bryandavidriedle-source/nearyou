"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { callRequestSchema, type CallRequestInput } from "@/lib/schemas";
import { messages, type Language } from "@/lib/i18n";

type Props = {
  lang: Language;
};

export function HotlineForm({ lang }: Props) {
  const m = messages[lang];
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors } } = useForm<CallRequestInput>({
    resolver: zodResolver(callRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      city: "Lausanne",
      category: "Visite senior",
      preferredSlot: "matin",
      contactMode: "phone",
      note: "",
      consent: false,
      source: "web",
      website: "",
      submittedAt: new Date().toISOString(),
      turnstileToken: "",
    },
  });

  const onSubmit = async (values: CallRequestInput) => {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/hotline-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setError(m.hotline.callbackError);
      return;
    }

    setMessage(m.hotline.callbackSuccess);
  };

  return (
    <Card className="rounded-2xl border-slate-200 bg-white p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register("website")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder={m.hotline.firstName} className="h-12" {...register("firstName")} />
          <Input placeholder={m.hotline.lastName} className="h-12" {...register("lastName")} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder={m.hotline.phone} className="h-12" {...register("phone")} />
          <Input placeholder={m.hotline.city} className="h-12" {...register("city")} />
        </div>
        <Input placeholder={m.hotline.serviceType} className="h-12" {...register("category")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm" value={watch("preferredSlot")} onChange={(e) => setValue("preferredSlot", e.target.value as CallRequestInput["preferredSlot"])}>
            <option value="matin">{lang === "fr" ? "Matin" : lang === "it" ? "Mattina" : lang === "de" ? "Morgen" : "Morning"}</option>
            <option value="apres-midi">{lang === "fr" ? "Apres-midi" : lang === "it" ? "Pomeriggio" : lang === "de" ? "Nachmittag" : "Afternoon"}</option>
            <option value="soir">{lang === "fr" ? "Soir" : lang === "it" ? "Sera" : lang === "de" ? "Abend" : "Evening"}</option>
          </select>
          <select className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm" value={watch("contactMode")} onChange={(e) => setValue("contactMode", e.target.value as CallRequestInput["contactMode"])}>
            <option value="phone">{m.hotline.contactModePhone}</option>
            <option value="whatsapp">{m.hotline.contactModeWhatsapp}</option>
          </select>
        </div>
        <Textarea placeholder={m.hotline.details} {...register("note")} />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={watch("consent")} onChange={(e) => setValue("consent", e.target.checked)} />
          {m.hotline.consent}
        </label>
        {errors.consent ? <p className="text-sm text-red-600">{errors.consent.message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        <Button disabled={isSubmitting} className="h-12 rounded-xl bg-green-600 hover:bg-green-700">{isSubmitting ? m.hotline.sending : m.hotline.requestCallback}</Button>
      </form>
    </Card>
  );
}
