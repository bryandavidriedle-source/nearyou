"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/forms/form-field";
import { SuccessState } from "@/components/shared/success-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/schemas";
import type { FormApiResponse } from "@/lib/types";

export function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      consent: false,
    },
  });

  const onSubmit = async (values: ContactMessageInput) => {
    setSubmitError(null);

    const response = await fetch("/api/contact-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = (await response.json()) as FormApiResponse;

    if (!response.ok || !data.success) {
      setSubmitError(data.message || "Une erreur est survenue. Merci de réessayer.");
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <SuccessState
        title="Message envoyé"
        description="Merci pour votre message. Notre équipe vous répond rapidement."
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField id="fullName" label="Nom complet" error={errors.fullName?.message}>
        <Input id="fullName" placeholder="Sophie Martin" {...register("fullName")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="vous@email.ch" {...register("email")} />
        </FormField>
        <FormField id="phone" label="Téléphone (optionnel)" error={errors.phone?.message}>
          <Input id="phone" placeholder="+41 79 000 00 00" {...register("phone")} />
        </FormField>
      </div>

      <FormField id="subject" label="Sujet" error={errors.subject?.message}>
        <Input id="subject" placeholder="Votre question" {...register("subject")} />
      </FormField>

      <FormField id="message" label="Message" error={errors.message?.message}>
        <Textarea id="message" className="min-h-32" placeholder="Expliquez-nous votre besoin..." {...register("message")} />
      </FormField>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("consent")}
            onCheckedChange={(checked) => setValue("consent", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte la politique de confidentialité et l'utilisation de mes données pour traiter ma demande.
          </span>
        </label>
        {errors.consent?.message ? <p className="text-xs text-destructive">{errors.consent.message}</p> : null}
      </div>

      {submitError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours..." : "Envoyer"}
      </Button>
    </form>
  );
}
