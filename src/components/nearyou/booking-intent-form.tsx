"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { bookingIntentSchema, type BookingIntentInput } from "@/lib/schemas";

type Props = {
  missionId: string;
  defaultFromPrice: number;
};

export function BookingIntentForm({ missionId, defaultFromPrice }: Props) {
  const [result, setResult] = useState<string | null>(null);

  const { register, setValue, watch, handleSubmit, formState: { isSubmitting } } = useForm<BookingIntentInput>({
    resolver: zodResolver(bookingIntentSchema),
    defaultValues: {
      missionId,
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      isGuest: true,
      contactEmail: "",
      contactPhone: "",
      reservationSource: "app",
      details: "",
    },
  });

  const onSubmit = async (values: BookingIntentInput) => {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setResult("Booking could not be created.");
      return;
    }

    setResult(values.isGuest ? "Almost done. Create your account to finalize booking." : "Booking created. Payment pending.");
  };

  return (
    <Card className="rounded-2xl border-slate-200 bg-white p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="datetime-local" value={watch("startAt").slice(0, 16)} onChange={(e) => setValue("startAt", new Date(e.target.value).toISOString())} />
          <Input type="datetime-local" value={watch("endAt").slice(0, 16)} onChange={(e) => setValue("endAt", new Date(e.target.value).toISOString())} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Email" {...register("contactEmail")} />
          <Input placeholder="Phone" {...register("contactPhone")} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={watch("isGuest")} onChange={(e) => setValue("isGuest", e.target.checked)} />
          Continue as guest first (create account at final step)
        </label>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={watch("reservationSource")} onChange={(e) => setValue("reservationSource", e.target.value as BookingIntentInput["reservationSource"])}>
          <option value="app">App</option>
          <option value="partner_cafe">Partner cafe</option>
          <option value="partner_pharmacy">Partner pharmacy</option>
          <option value="hotline">Hotline</option>
        </select>
        <Textarea placeholder="Details" {...register("details")} />
        <p className="text-sm text-slate-600">Visible price: from {defaultFromPrice} CHF. Final price adjusts after details.</p>
        <Button disabled={isSubmitting} className="rounded-xl bg-green-600 hover:bg-green-700">{isSubmitting ? "Saving..." : "Continue booking"}</Button>
        {result ? <p className="text-sm text-blue-700">{result}</p> : null}
      </form>
    </Card>
  );
}
