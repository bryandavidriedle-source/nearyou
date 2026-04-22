"use client";

import { useEffect, useState } from "react";
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
import { serviceRequestSchema, type ServiceRequestFormInput, type ServiceRequestInput } from "@/lib/schemas";
import type { FormApiResponse } from "@/lib/types";

type LeadFormProps = {
  initialCategory?: string;
};

type CatalogSuggestion = {
  id: string;
  title: string;
  categoryName: string;
  fromPriceChf: number;
};

export function LeadForm({ initialCategory }: LeadFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const safeInitialCategory =
    initialCategory && serviceCategories.some((category) => category.label === initialCategory)
      ? initialCategory
      : serviceCategories[0].label;

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestFormInput>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "Lausanne",
      category: safeInitialCategory,
      serviceId: "",
      interventionAddress: "",
      accessInstructions: "",
      doorCode: "",
      floor: "",
      parkingInstructions: "",
      gardenAccessInstructions: "",
      materialsAvailable: false,
      requestedFor: "",
      description: "",
      urgency: "Moyenne",
      budget: "",
      consent: false,
      website: "",
      submittedAt: new Date().toISOString(),
      turnstileToken: "",
    },
  });

  useEffect(() => {
    const query = serviceQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoadingSuggestions(true);
      const response = await fetch(`/api/catalog/services?q=${encodeURIComponent(query)}&limit=8`);
      const payload = (await response.json().catch(() => null)) as { success?: boolean; data?: CatalogSuggestion[] } | null;
      setLoadingSuggestions(false);
      if (response.ok && payload?.success && payload.data) {
        setSuggestions(payload.data);
      } else {
        setSuggestions([]);
      }
    }, 180);

    return () => clearTimeout(timeout);
  }, [serviceQuery]);

  function selectSuggestion(item: CatalogSuggestion) {
    setValue("serviceId", item.id, { shouldValidate: true });
    setValue("category", item.categoryName, { shouldValidate: true });
    setServiceQuery(`${item.title} - des ${item.fromPriceChf} CHF`);
    setSuggestions([]);
  }

  const onSubmit = async (values: ServiceRequestFormInput) => {
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
    <form id="service-request-form" className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />

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

      <div className="space-y-2">
        <FormField id="serviceQuery" label="Service recherché (autocomplete catalogue)">
          <Input
            id="serviceQuery"
            value={serviceQuery}
            onChange={(event) => {
              setServiceQuery(event.target.value);
              setValue("serviceId", "", { shouldValidate: true });
            }}
            placeholder="Ex: Tondre la pelouse, Promenade de chien..."
          />
        </FormField>
        {loadingSuggestions ? <p className="text-xs text-slate-500">Recherche des services...</p> : null}
        {suggestions.length > 0 ? (
          <div className="max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectSuggestion(item)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span>{item.title}</span>
                <span className="text-xs font-semibold text-green-700">dès {item.fromPriceChf} CHF</span>
              </button>
            ))}
          </div>
        ) : null}
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

      <FormField id="interventionAddress" label="Adresse d'intervention" error={errors.interventionAddress?.message}>
        <Input id="interventionAddress" placeholder="Rue, numero, NPA, ville" {...register("interventionAddress")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="requestedFor" label="Date/heure souhaitée (optionnel)" error={errors.requestedFor?.message}>
          <Input id="requestedFor" type="datetime-local" {...register("requestedFor")} />
        </FormField>
        <FormField id="budget" label="Budget estimatif" error={errors.budget?.message}>
          <Input id="budget" placeholder="Ex: 150-250 CHF" {...register("budget")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="doorCode" label="Code porte (optionnel)" error={errors.doorCode?.message}>
          <Input id="doorCode" placeholder="Code d'entrée" {...register("doorCode")} />
        </FormField>
        <FormField id="floor" label="Étage (optionnel)" error={errors.floor?.message}>
          <Input id="floor" placeholder="Ex: 3e gauche" {...register("floor")} />
        </FormField>
        <FormField id="parkingInstructions" label="Stationnement (optionnel)" error={errors.parkingInstructions?.message}>
          <Input id="parkingInstructions" placeholder="Infos parking utiles" {...register("parkingInstructions")} />
        </FormField>
        <FormField id="gardenAccessInstructions" label="Accès jardin (optionnel)" error={errors.gardenAccessInstructions?.message}>
          <Input id="gardenAccessInstructions" placeholder="Portail, acces lateral..." {...register("gardenAccessInstructions")} />
        </FormField>
      </div>

        <FormField
          id="accessInstructions"
          label="Instructions d'accès"
          hint="Indiquez les points d'attention: accès immeuble, ascenseur, difficultés, etc."
          error={errors.accessInstructions?.message}
        >
          <Textarea id="accessInstructions" placeholder="Instructions d'accès..." className="min-h-24" {...register("accessInstructions")} />
        </FormField>

      <FormField
        id="description"
        label="Description du besoin"
        hint="Précisez le contexte, la taille du besoin et vos contraintes éventuelles."
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="Exemple: besoin d'un ménage complet de 3 pièces avant vendredi."
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
              setValue("urgency", value as ServiceRequestInput["urgency"], { shouldValidate: true });
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
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("materialsAvailable")}
            onCheckedChange={(checked) => setValue("materialsAvailable", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J&apos;ai déjà du matériel disponible sur place.
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("consent")}
            onCheckedChange={(checked) => setValue("consent", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J&apos;accepte que mes informations soient utilisees pour la mise en relation avec un prestataire.
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
