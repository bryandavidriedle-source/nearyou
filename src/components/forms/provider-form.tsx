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
import { providerAvailabilityOptions, serviceCategories } from "@/lib/constants";
import { providerApplicationSchema, type ProviderApplicationInput } from "@/lib/schemas";
import type { FormApiResponse } from "@/lib/types";

export function ProviderForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderApplicationInput>({
    resolver: zodResolver(providerApplicationSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
      city: "Lausanne",
      category: serviceCategories[0].label,
      servicesDescription: "",
      yearsExperience: "",
      availability: providerAvailabilityOptions[0],
      websiteOrInstagram: "",
      consent: false,
    },
  });

  const onSubmit = async (values: ProviderApplicationInput) => {
    setSubmitError(null);

    const response = await fetch("/api/provider-applications", {
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
        title="Candidature envoyée"
        description="Merci pour votre intérêt. Nous vous recontactons rapidement pour valider votre profil prestataire test."
        ctaLabel="Retour à l'accueil"
      />
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField id="businessName" label="Nom de l'entreprise ou nom complet" error={errors.businessName?.message}>
        <Input id="businessName" placeholder="Atelier Martin" {...register("businessName")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="contact@exemple.ch" {...register("email")} />
        </FormField>
        <FormField id="phone" label="Téléphone" error={errors.phone?.message}>
          <Input id="phone" type="tel" placeholder="+41 79 123 45 67" {...register("phone")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="city" label="Ville" error={errors.city?.message}>
          <Input id="city" placeholder="Lausanne" {...register("city")} />
        </FormField>
        <FormField id="category" label="Catégorie" error={errors.category?.message}>
          <Select
            value={watch("category")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("category", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger id="category" className="h-10 w-full rounded-md">
              <SelectValue />
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

      <FormField id="servicesDescription" label="Description des services" error={errors.servicesDescription?.message}>
        <Textarea
          id="servicesDescription"
          placeholder="Décrivez vos prestations, votre zone d'intervention et vos points forts."
          className="min-h-28"
          {...register("servicesDescription")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="yearsExperience" label="Années d'expérience" error={errors.yearsExperience?.message}>
          <Input id="yearsExperience" placeholder="Ex: 5" {...register("yearsExperience")} />
        </FormField>
        <FormField id="availability" label="Disponibilité" error={errors.availability?.message}>
          <Select
            value={watch("availability")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("availability", value, { shouldValidate: true });
            }}
          >
            <SelectTrigger id="availability" className="h-10 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providerAvailabilityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField id="websiteOrInstagram" label="Site web ou Instagram (facultatif)" error={errors.websiteOrInstagram?.message}>
        <Input id="websiteOrInstagram" placeholder="https://..." {...register("websiteOrInstagram")} />
      </FormField>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("consent")}
            onCheckedChange={(checked) => setValue("consent", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte que mes informations soient utilisées pour l'étude de ma candidature prestataire.
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
        {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
      </Button>
    </form>
  );
}
