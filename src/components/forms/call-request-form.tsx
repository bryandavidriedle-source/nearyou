"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/forms/form-field";
import { SuccessState } from "@/components/shared/success-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  callbackCategories,
  callbackContactModes,
  callbackSlots,
} from "@/lib/constants";
import { callRequestSchema, type CallRequestInput } from "@/lib/schemas";
import type { FormApiResponse } from "@/lib/types";

export function CallRequestForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CallRequestInput>({
    resolver: zodResolver(callRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      city: "Lausanne",
      category: callbackCategories[0],
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
    setSubmitError(null);

    const response = await fetch("/api/call-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as FormApiResponse;

    if (!response.ok || !data.success) {
      setSubmitError(data.message || "Une erreur est survenue. Merci de reessayer.");
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <SuccessState
        title="Demande de rappel envoyee"
        description="Merci. Un membre de l'equipe vous rappelle rapidement selon le creneau choisi."
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("website")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="firstName" label="Prenom" error={errors.firstName?.message}>
          <Input id="firstName" className="h-12 text-base" placeholder="Marie" {...register("firstName")} />
        </FormField>
        <FormField id="lastName" label="Nom" error={errors.lastName?.message}>
          <Input id="lastName" className="h-12 text-base" placeholder="Dupont" {...register("lastName")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="phone" label="Telephone" error={errors.phone?.message}>
          <Input id="phone" className="h-12 text-base" type="tel" placeholder="+41 79 123 45 67" {...register("phone")} />
        </FormField>
        <FormField id="city" label="Ville" error={errors.city?.message}>
          <Input id="city" className="h-12 text-base" placeholder="Lausanne" {...register("city")} />
        </FormField>
      </div>

      <FormField id="category" label="Type de besoin" error={errors.category?.message}>
        <Select
          value={watch("category")}
          onValueChange={(value) => {
            if (!value) return;
            setValue("category", value, { shouldValidate: true });
          }}
        >
          <SelectTrigger id="category" className="h-12 w-full rounded-md text-base">
            <SelectValue placeholder="Choisir un besoin" />
          </SelectTrigger>
          <SelectContent>
            {callbackCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="preferredSlot" label="Creneau souhaite" error={errors.preferredSlot?.message}>
          <Select
            value={watch("preferredSlot")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("preferredSlot", value as CallRequestInput["preferredSlot"], {
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger id="preferredSlot" className="h-12 w-full rounded-md text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {callbackSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="contactMode" label="Mode de contact" error={errors.contactMode?.message}>
          <Select
            value={watch("contactMode")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("contactMode", value as CallRequestInput["contactMode"], {
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger id="contactMode" className="h-12 w-full rounded-md text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {callbackContactModes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode === "phone" ? "Appel" : "WhatsApp"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField id="note" label="Commentaire (facultatif)" error={errors.note?.message}>
        <Textarea
          id="note"
          className="min-h-28 text-base"
          placeholder="Ajoutez un detail utile pour le rappel."
          {...register("note")}
        />
      </FormField>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-4">
          <Checkbox
            checked={watch("consent")}
            onCheckedChange={(checked) => setValue("consent", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte que mes donnees soient utilisees pour organiser mon rappel et ma demande.
          </span>
        </label>
        {errors.consent?.message ? <p className="text-xs text-destructive">{errors.consent.message}</p> : null}
      </div>

      {submitError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours..." : "Etre rappele"}
      </Button>
    </form>
  );
}
