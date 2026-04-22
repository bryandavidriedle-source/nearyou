"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { bookingIntentSchema, type BookingIntentInput } from "@/lib/schemas";
import type { FormApiResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  missionId: string;
  defaultFromPrice: number;
};

const slotTemplates = [
  { id: "morning", label: "Matin (08:00 - 10:00)", startHour: 8, durationHours: 2 },
  { id: "midday", label: "Mi-journee (11:00 - 13:00)", startHour: 11, durationHours: 2 },
  { id: "afternoon", label: "Apres-midi (14:00 - 16:00)", startHour: 14, durationHours: 2 },
  { id: "evening", label: "Soir (17:00 - 19:00)", startHour: 17, durationHours: 2 },
] as const;

function nextDayIsoDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function buildIsoRange(day: string, startHour: number, durationHours: number) {
  const start = new Date(`${day}T00:00:00`);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + durationHours);
  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}

export function BookingIntentForm({ missionId, defaultFromPrice }: Props) {
  const [result, setResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<"success" | "error" | null>(null);
  const [selectedDate, setSelectedDate] = useState(nextDayIsoDate());
  const [selectedSlot, setSelectedSlot] = useState<(typeof slotTemplates)[number]["id"]>("morning");

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<BookingIntentInput>({
    resolver: zodResolver(bookingIntentSchema),
    defaultValues: {
      missionId,
      ...buildIsoRange(selectedDate, slotTemplates[0].startHour, slotTemplates[0].durationHours),
      isGuest: false,
      contactEmail: "",
      contactPhone: "",
      reservationSource: "app",
      details: "",
      consent: false,
      website: "",
      submittedAt: new Date().toISOString(),
      turnstileToken: "",
    },
  });

  const slotSummary = useMemo(() => {
    const slot = slotTemplates.find((item) => item.id === selectedSlot) ?? slotTemplates[0];
    return {
      date: new Date(`${selectedDate}T12:00:00`).toLocaleDateString("fr-CH", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
      label: slot.label,
    };
  }, [selectedDate, selectedSlot]);

  const contactEmail = watch("contactEmail");
  const contactPhone = watch("contactPhone");
  const reservationSource = watch("reservationSource");
  const details = watch("details");
  const consent = watch("consent");

  const bookingPreview = useMemo(
    () => ({
      contactEmail,
      contactPhone,
      reservationSource,
      details,
      consent,
    }),
    [consent, contactEmail, contactPhone, details, reservationSource],
  );

  function updateSlot(day: string, slotId: (typeof slotTemplates)[number]["id"]) {
    const slot = slotTemplates.find((item) => item.id === slotId) ?? slotTemplates[0];
    const range = buildIsoRange(day, slot.startHour, slot.durationHours);
    setValue("startAt", range.startAt, { shouldValidate: true });
    setValue("endAt", range.endAt, { shouldValidate: true });
  }

  const onSubmit = async (values: BookingIntentInput) => {
    setResult(null);
    setResultType(null);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json().catch(() => null)) as (FormApiResponse & { bookingId?: string }) | null;
    if (!response.ok || !data?.success) {
      setResultType("error");
      setResult(data?.message ?? "Reservation impossible pour le moment.");
      return;
    }

    setResultType("success");
    setResult(`Reservation creee (ref. ${data.bookingId?.slice(0, 8) ?? "NearYou"}). Nous confirmons les details rapidement.`);
  };

  return (
    <Card className="premium-card space-y-4 p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Finaliser ma reservation</h2>
        <p className="text-sm text-slate-600">Tarif indicatif des {defaultFromPrice} CHF. Le montant final depend du detail de mission.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register("website")}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Date souhaitee</label>
            <Input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={selectedDate}
              onChange={(event) => {
                const day = event.target.value;
                setSelectedDate(day);
                updateSlot(day, selectedSlot);
              }}
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Creneau</label>
            <select
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={selectedSlot}
              onChange={(event) => {
                const slot = event.target.value as (typeof slotTemplates)[number]["id"];
                setSelectedSlot(slot);
                updateSlot(selectedDate, slot);
              }}
            >
              {slotTemplates.map((slot) => (
                <option key={slot.id} value={slot.id}>{slot.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email de contact</label>
            <Input placeholder="vous@email.ch" {...register("contactEmail")} className="h-11" />
            {errors.contactEmail ? <p className="text-xs text-red-600">{errors.contactEmail.message}</p> : null}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Telephone</label>
            <Input placeholder="+41 79 123 45 67" {...register("contactPhone")} className="h-11" />
            {errors.contactPhone ? <p className="text-xs text-red-600">{errors.contactPhone.message}</p> : null}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Details utiles</label>
          <Textarea placeholder="Adresse, acces, instructions particulieres..." {...register("details")} className="min-h-24" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
            value={reservationSource}
            onChange={(e) => setValue("reservationSource", e.target.value as BookingIntentInput["reservationSource"])}
          >
            <option value="app">Site NearYou</option>
            <option value="partner_cafe">Partenaire cafe</option>
            <option value="partner_pharmacy">Partenaire pharmacie</option>
            <option value="hotline">Hotline</option>
          </select>
        </div>

        <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <input type="checkbox" checked={consent} onChange={(e) => setValue("consent", e.target.checked, { shouldValidate: true })} />
          <span>J'accepte que NearYou traite ma demande pour organiser la mise en relation.</span>
        </label>
        {errors.consent ? <p className="text-xs text-red-600">{errors.consent.message}</p> : null}
        {errors.startAt ? <p className="text-xs text-red-600">{errors.startAt.message}</p> : null}
        {errors.endAt ? <p className="text-xs text-red-600">{errors.endAt.message}</p> : null}

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          Creneau selectionne: {slotSummary.date} - {slotSummary.label}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Resume avant confirmation</p>
          <p className="mt-1">Service: Mission #{missionId.slice(0, 8)}</p>
          <p>Date et creneau: {slotSummary.date} - {slotSummary.label}</p>
          <p>Email: {bookingPreview.contactEmail || "-"}</p>
          <p>Telephone: {bookingPreview.contactPhone || "-"}</p>
          <p>Canal: {bookingPreview.reservationSource}</p>
          <p className="mt-1 text-xs text-slate-500">
            {bookingPreview.details ? `Details: ${bookingPreview.details}` : "Aucun detail complementaire."}
          </p>
          {!bookingPreview.consent ? (
            <p className="mt-1 text-xs font-medium text-amber-700">L'accord de traitement est requis pour valider.</p>
          ) : null}
        </div>

        <Button disabled={isSubmitting} className="h-11 w-full rounded-xl bg-green-600 hover:bg-green-700">
          {isSubmitting ? "Validation en cours..." : "Confirmer ma reservation"}
        </Button>

        {result ? (
          <p className={`rounded-lg px-3 py-2 text-sm ${resultType === "success" ? "border border-green-200 bg-green-50 text-green-700" : "border border-red-200 bg-red-50 text-red-700"}`}>
            {result}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
