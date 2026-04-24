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
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [permitFile, setPermitFile] = useState<File | null>(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderApplicationInput>({
    resolver: zodResolver(providerApplicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      phone: "",
      birthDate: "",
      addressLine: "",
      postalCode: "",
      canton: "VD",
      city: "Lausanne",
      country: "Suisse",
      interventionRadiusKm: 20,
      category: serviceCategories[0].label,
      legalStatus: "independant",
      companyName: "",
      ideNumber: "",
      iban: "",
      vatNumber: "",
      languages: "francais",
      acceptsUrgency: false,
      servicesDescription: "",
      yearsExperience: "",
      availability: providerAvailabilityOptions[0],
      idDocumentType: "piece_identite",
      residencePermitType: "",
      websiteOrInstagram: "",
      legalResponsibilityAck: false,
      termsAck: false,
      consent: false,
      website: "",
      submittedAt: new Date().toISOString(),
      turnstileToken: "",
    },
  });

  const selectedIdDocType = watch("idDocumentType");

  const onSubmit = async (values: ProviderApplicationInput) => {
    setSubmitError(null);

    if (values.idDocumentType === "piece_identite" && !identityFile) {
      setSubmitError("Veuillez joindre une pièce d'identité.");
      return;
    }

    if ((values.idDocumentType === "titre_sejour_b" || values.idDocumentType === "titre_sejour_c") && !permitFile) {
      setSubmitError("Veuillez joindre un titre de séjour B ou C.");
      return;
    }

    const formData = new FormData();
    formData.append("payload", JSON.stringify(values));
    if (identityFile) formData.append("identityDocument", identityFile);
    if (permitFile) formData.append("residencePermit", permitFile);

    const response = await fetch("/api/provider-applications", {
      method: "POST",
      body: formData,
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
        title="Dossier prestataire envoyé"
        description="Merci. Votre dossier est en attente de validation manuelle. Vous recevrez un email dès qu'un administrateur aura statué."
        ctaLabel="Retour à l'accueil"
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
        <FormField id="firstName" label="Prénom" error={errors.firstName?.message}>
          <Input id="firstName" placeholder="Marie" {...register("firstName")} />
        </FormField>
        <FormField id="lastName" label="Nom" error={errors.lastName?.message}>
          <Input id="lastName" placeholder="Dupont" {...register("lastName")} />
        </FormField>
      </div>

      <FormField id="businessName" label="Nom professionnel affiché" error={errors.businessName?.message}>
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

      <FormField
        id="birthDate"
        label="Date de naissance"
        hint="Âge minimum requis: 15 ans. Entre 15 et 17 ans, seules des missions simples sont autorisées."
        error={errors.birthDate?.message}
      >
        <Input id="birthDate" type="date" {...register("birthDate")} />
      </FormField>

      <FormField id="addressLine" label="Adresse" error={errors.addressLine?.message}>
        <Input id="addressLine" placeholder="Rue du Lac 12" {...register("addressLine")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="postalCode" label="Code postal" error={errors.postalCode?.message}>
          <Input id="postalCode" placeholder="1003" {...register("postalCode")} />
        </FormField>
        <FormField id="city" label="Ville" error={errors.city?.message}>
          <Input id="city" placeholder="Lausanne" {...register("city")} />
        </FormField>
        <FormField id="canton" label="Canton" error={errors.canton?.message}>
          <Input id="canton" placeholder="VD" {...register("canton")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="country" label="Pays" error={errors.country?.message}>
          <Input id="country" placeholder="Suisse" {...register("country")} />
        </FormField>
        <FormField id="languages" label="Langues" error={errors.languages?.message}>
          <Input id="languages" placeholder="Francais, anglais" {...register("languages")} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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

        <FormField id="interventionRadiusKm" label="Rayon d'intervention (km)" error={errors.interventionRadiusKm?.message}>
          <Input id="interventionRadiusKm" type="number" min={1} max={80} {...register("interventionRadiusKm", { valueAsNumber: true })} />
        </FormField>

        <FormField id="legalStatus" label="Statut" error={errors.legalStatus?.message}>
          <Select
            value={watch("legalStatus")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("legalStatus", value as ProviderApplicationInput["legalStatus"], { shouldValidate: true });
            }}
          >
            <SelectTrigger id="legalStatus" className="h-10 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="independant">Indépendant</SelectItem>
              <SelectItem value="entreprise">Entreprise</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="companyName" label="Raison sociale (si existante)" error={errors.companyName?.message}>
          <Input id="companyName" placeholder="Ex: ABC Services Sàrl" {...register("companyName")} />
        </FormField>
        <FormField id="ideNumber" label="Numéro IDE (facultatif)" error={errors.ideNumber?.message}>
          <Input id="ideNumber" placeholder="CHE-123.456.789" {...register("ideNumber")} />
        </FormField>
        <FormField id="iban" label="IBAN (facultatif)" error={errors.iban?.message}>
          <Input id="iban" placeholder="CH93 0076 2011 6238 5295 7" {...register("iban")} />
        </FormField>
        <FormField id="vatNumber" label="Numéro TVA (facultatif)" error={errors.vatNumber?.message}>
          <Input id="vatNumber" placeholder="CHE-123.456.789 TVA" {...register("vatNumber")} />
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="idDocumentType" label="Document transmis" error={errors.idDocumentType?.message}>
          <Select
            value={watch("idDocumentType")}
            onValueChange={(value) => {
              if (!value) return;
              setValue("idDocumentType", value as ProviderApplicationInput["idDocumentType"], { shouldValidate: true });
            }}
          >
            <SelectTrigger id="idDocumentType" className="h-10 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="piece_identite">Pièce d'identité</SelectItem>
              <SelectItem value="titre_sejour_b">Titre de séjour B</SelectItem>
              <SelectItem value="titre_sejour_c">Titre de séjour C</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {(selectedIdDocType === "titre_sejour_b" || selectedIdDocType === "titre_sejour_c") ? (
          <FormField id="residencePermitType" label="Type du titre" error={errors.residencePermitType?.message}>
            <Select
              value={watch("residencePermitType")}
              onValueChange={(value) => {
                if (!value) return;
                setValue("residencePermitType", value as ProviderApplicationInput["residencePermitType"], { shouldValidate: true });
              }}
            >
              <SelectTrigger id="residencePermitType" className="h-10 w-full rounded-md">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        ) : <div className="hidden sm:block" />}
      </div>

      {selectedIdDocType === "piece_identite" ? (
        <FormField id="identityDocument" label="Upload pièce d'identité (PDF/JPG/PNG, max 8MB)">
          <Input
            id="identityDocument"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(event) => setIdentityFile(event.target.files?.[0] ?? null)}
          />
        </FormField>
      ) : (
        <FormField id="residencePermit" label="Upload titre de séjour B/C (PDF/JPG/PNG, max 8MB)">
          <Input
            id="residencePermit"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(event) => setPermitFile(event.target.files?.[0] ?? null)}
          />
        </FormField>
      )}

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("acceptsUrgency")}
            onCheckedChange={(checked) => setValue("acceptsUrgency", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte les interventions urgentes (dans la limite de mes disponibilités).
          </span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("legalResponsibilityAck")}
            onCheckedChange={(checked) => setValue("legalResponsibilityAck", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            Je confirme agir sous ma propre responsabilité et rester seul responsable de mes obligations légales, fiscales, sociales et administratives.
          </span>
        </label>
        {errors.legalResponsibilityAck?.message ? <p className="text-xs text-destructive">{errors.legalResponsibilityAck.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("termsAck")}
            onCheckedChange={(checked) => setValue("termsAck", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte les conditions prestataires et comprends que la validation PrèsDeToi ne remplace pas mes obligations légales en Suisse.
          </span>
        </label>
        {errors.termsAck?.message ? <p className="text-xs text-destructive">{errors.termsAck.message}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox
            checked={watch("consent")}
            onCheckedChange={(checked) => setValue("consent", Boolean(checked), { shouldValidate: true })}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'autorise PrèsDeToi à traiter ce dossier et mes justificatifs, visibles uniquement par les administrateurs autorisés.
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
        {isSubmitting ? "Envoi en cours..." : "Envoyer mon dossier prestataire"}
      </Button>
    </form>
  );
}

