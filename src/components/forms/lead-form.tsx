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
import { serviceCategories, urgencyOptions } from "@/lib/constants";
import { serviceRequestSchema, type ServiceRequestInput } from "@/lib/schemas";
import type { FormApiResponse } from "@/lib/types";

type LeadFormProps = {
  initialCategory?: string;
};

export function LeadForm({ initialCategory }: LeadFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestInput>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "Lausanne",
      category: initialCategory ?? serviceCategories[0].label,
      description: "",
      urgency: "Moyenne",
      budget: "",
      consent: false,
    },
  });

  const onSubmit = async (values: ServiceRequestInput) => {
    setSubmitError(null);

    const response = await fetch("/api/service-requests", {
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
        title="Demande envoyée"
        description="Merci. Votre demande a bien été reçue. Vous pouvez suivre son évolution depuis votre espace client."
        ctaLabel="Voir mes demandes"
        ctaHref="/espace-client"
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="lastName" label="Nom" error={errors.lastName?.message}>
          <Input id="lastName" placeholder="Dupont" {...register("lastName")} />
        </FormField>
        <FormField id="firstName" label="Prénom" error={errors.firstName?.message}>
          <Input id="firstName" placeholder="Marie" {...register("firstName")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="vous@email.ch" {...register("email")} />
        </FormField>
        <FormField id="phone" label="Téléphone" error={errors.phone?.message}>
          <Input id="phone" type="tel" placeholder="+41 79 123 45 67" {...register("phone")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="city" label="Ville" error={errors.city?.message}>
          <Input id="city" placeholder="Lausanne" {...register("city")} />
        </FormField>
        <FormField id="category" label="Catégorie de service" error={errors.category?.message}>
          <Select
            value={watch("category")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("category", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger id="category" className="h-10 w-full rounded-md">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((category) => (
                <SelectItem key={category.slug} value={category.label}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField
        id="description"
        label="Description du besoin"
        hint="Précisez le contexte, la taille du besoin et vos contraintes éventuelles."
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="Exemple: Besoin d'un ménage complet de 3 pièces avant vendredi."
          className="min-h-28"
          {...register("description")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="urgency" label="Urgence" error={errors.urgency?.message}>
          <Select
            value={watch("urgency")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("urgency", value as ServiceRequestInput["urgency"], {
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger id="urgency" className="h-10 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {urgencyOptions.map((urgency) => (
                <SelectItem key={urgency} value={urgency}>
                  {urgency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="budget" label="Budget estimatif" error={errors.budget?.message}>
          <Input id="budget" placeholder="Ex: 150-250 CHF" {...register("budget")} />
        </FormField>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("consent")}
            onCheckedChange={(checked) => setValue("consent", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte que mes informations soient utilisées pour la mise en relation avec un prestataire.
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
        {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
      </Button>
    </form>
  );
}
