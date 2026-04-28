"use client";

import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

type Capability = ProviderApplicationInput["capabilities"][number];

const ACCEPTED_DOCUMENTS = ".pdf,.jpg,.jpeg,.png,.webp";
const ACCEPTED_PROFILE_PHOTO = ".jpg,.jpeg,.png,.webp";

function getCapability(values: Capability[] | undefined, slug: string) {
  return values?.find((item) => item.slug === slug) ?? null;
}

export function ProviderForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [parentAuthorizationFile, setParentAuthorizationFile] = useState<File | null>(null);

  const capabilityOptions = useMemo(
    () => serviceCategories.map((category) => ({ slug: category.slug, label: category.label })),
    [],
  );

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderApplicationInput>({
    resolver: zodResolver(providerApplicationSchema),
    defaultValues: {
      agePath: "adult",
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
      capabilities: [],
      hasDrivingLicense: false,
      drivingLicenseDetails: "",
      hasVehicle: false,
      coverageAreas: "Lausanne et environs",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      parentPhone: "",
      parentAddressLine: "",
      juniorSafetyAck: false,
      parentAuthorizationAck: false,
      websiteOrInstagram: "",
      legalResponsibilityAck: false,
      termsAck: false,
      consent: false,
      website: "",
      submittedAt: new Date().toISOString(),
      turnstileToken: "",
    },
  });

  const agePath = watch("agePath");
  const selectedIdDocType = watch("idDocumentType");
  const selectedCapabilities = watch("capabilities") ?? [];
  const hasDrivingLicense = watch("hasDrivingLicense");

  useEffect(() => {
    if (agePath !== "junior") return;
    setValue("legalStatus", "independant", { shouldValidate: true });
    setValue("acceptsUrgency", false, { shouldValidate: true });
  }, [agePath, setValue]);

  function setAgePath(next: ProviderApplicationInput["agePath"]) {
    setValue("agePath", next, { shouldValidate: true });
  }

  function toggleCapability(option: { slug: string; label: string }, checked: boolean) {
    const current = selectedCapabilities;
    const next = checked
      ? [...current, { slug: option.slug, label: option.label, hasEquipment: false }]
      : current.filter((item) => item.slug !== option.slug);

    setValue("capabilities", next, { shouldDirty: true, shouldValidate: true });
    if (checked && next.length === 1) {
      setValue("category", option.label, { shouldValidate: true });
    }
  }

  function toggleEquipment(slug: string, checked: boolean) {
    setValue(
      "capabilities",
      selectedCapabilities.map((item) => (item.slug === slug ? { ...item, hasEquipment: checked } : item)),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  const onSubmit = async (values: ProviderApplicationInput) => {
    setSubmitError(null);

    if (!profilePhotoFile) {
      setSubmitError("Veuillez joindre une photo de profil claire.");
      return;
    }

    if ((values.idDocumentType === "piece_identite" || values.idDocumentType === "permis_conduire") && !identityFile) {
      setSubmitError("Veuillez joindre le document d'identification choisi.");
      return;
    }

    if ((values.idDocumentType === "titre_sejour_b" || values.idDocumentType === "titre_sejour_c") && !permitFile) {
      setSubmitError("Veuillez joindre un titre de sejour B ou C.");
      return;
    }

    if (values.agePath === "junior" && !parentAuthorizationFile) {
      setSubmitError("Veuillez joindre l'autorisation parentale signee.");
      return;
    }

    const formData = new FormData();
    formData.append("payload", JSON.stringify(values));
    formData.append("profilePhoto", profilePhotoFile);
    if (identityFile) formData.append("identityDocument", identityFile);
    if (permitFile) formData.append("residencePermit", permitFile);
    if (parentAuthorizationFile) formData.append("parentAuthorization", parentAuthorizationFile);

    const response = await fetch("/api/provider-applications", {
      method: "POST",
      body: formData,
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
        title="Dossier prestataire envoyé"
        description="Merci. Votre dossier est en attente de validation manuelle. Les profils 15-17 ans sont vérifiés avec l'autorisation parentale avant toute publication."
        ctaLabel="Retour à l'accueil"
      />
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("website")}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Choisir votre parcours</h2>
          <p className="text-sm text-slate-600">Les candidats mineurs ont un parcours renforcé et des missions limitées.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { value: "adult" as const, title: "18 ans et plus", text: "Parcours standard avec validation identité et paiement suisse." },
            { value: "junior" as const, title: "15-17 ans", text: "Autorisation parentale, contrôle renforcé et missions simples uniquement." },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAgePath(item.value)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                agePath === item.value ? "border-blue-500 bg-blue-50 text-blue-950" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200",
              )}
            >
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="mt-1 block text-xs leading-relaxed">{item.text}</span>
            </button>
          ))}
        </div>
        {errors.agePath?.message ? <p className="text-xs text-destructive">{errors.agePath.message}</p> : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Identité et contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="firstName" label="Prénom" error={errors.firstName?.message}>
            <Input id="firstName" placeholder="Marie" {...register("firstName")} />
          </FormField>
          <FormField id="lastName" label="Nom" error={errors.lastName?.message}>
            <Input id="lastName" placeholder="Dupont" {...register("lastName")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="contact@exemple.ch" {...register("email")} />
          </FormField>
          <FormField id="phone" label="Téléphone" error={errors.phone?.message}>
            <Input id="phone" type="tel" placeholder="+41 79 123 45 67" {...register("phone")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="birthDate"
            label="Date de naissance"
            hint="Moins de 15 ans: inscription prestataire impossible."
            error={errors.birthDate?.message}
          >
            <Input id="birthDate" type="date" {...register("birthDate")} />
          </FormField>
          <FormField id="profilePhoto" label="Photo de profil" hint="Image JPG/PNG/WEBP, visage reconnaissable.">
            <Input id="profilePhoto" type="file" accept={ACCEPTED_PROFILE_PHOTO} onChange={(event) => setProfilePhotoFile(event.target.files?.[0] ?? null)} />
          </FormField>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Adresse et zone couverte</h2>
        <FormField id="addressLine" label="Adresse" error={errors.addressLine?.message}>
          <Input id="addressLine" placeholder="Rue du Lac 12" {...register("addressLine")} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="postalCode" label="NPA" error={errors.postalCode?.message}>
            <Input id="postalCode" placeholder="1003" {...register("postalCode")} />
          </FormField>
          <FormField id="city" label="Ville" error={errors.city?.message}>
            <Input id="city" placeholder="Lausanne" {...register("city")} />
          </FormField>
          <FormField id="canton" label="Canton" error={errors.canton?.message}>
            <Input id="canton" placeholder="VD" {...register("canton")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <FormField id="coverageAreas" label="Zone géographique couverte" error={errors.coverageAreas?.message}>
            <Input id="coverageAreas" placeholder="St-Prex, Morges, Lausanne, La Côte" {...register("coverageAreas")} />
          </FormField>
          <FormField id="interventionRadiusKm" label="Rayon (km)" error={errors.interventionRadiusKm?.message}>
            <Input id="interventionRadiusKm" type="number" min={1} max={80} {...register("interventionRadiusKm", { valueAsNumber: true })} />
          </FormField>
        </div>

        <input type="hidden" value="Suisse" {...register("country")} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Capacités et matériel</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {capabilityOptions.map((option) => {
            const selected = getCapability(selectedCapabilities, option.slug);
            return (
              <div key={option.slug} className="rounded-xl border border-slate-200 bg-white p-3">
                <label className="flex items-start gap-3">
                  <Checkbox checked={Boolean(selected)} onCheckedChange={(checked) => toggleCapability(option, Boolean(checked))} />
                  <span className="text-sm font-medium text-slate-800">{option.label}</span>
                </label>
                {selected ? (
                  <label className="mt-3 flex items-start gap-3 pl-7">
                    <Checkbox checked={selected.hasEquipment} onCheckedChange={(checked) => toggleEquipment(option.slug, Boolean(checked))} />
                    <span className="text-xs text-slate-600">J'ai mon propre matériel pour cette capacité</span>
                  </label>
                ) : null}
              </div>
            );
          })}
        </div>
        {errors.capabilities?.message ? <p className="text-xs text-destructive">{errors.capabilities.message}</p> : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Profil professionnel</h2>
        <FormField id="businessName" label="Nom affiché sur le profil" error={errors.businessName?.message}>
          <Input id="businessName" placeholder="Marie - aide de proximité" {...register("businessName")} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="languages" label="Langues" error={errors.languages?.message}>
            <Input id="languages" placeholder="francais, anglais" {...register("languages")} />
          </FormField>
          <FormField id="availability" label="Disponibilité" error={errors.availability?.message}>
            <Select value={watch("availability")} onValueChange={(value) => value && setValue("availability", value, { shouldValidate: true })}>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="yearsExperience" label="Expérience" error={errors.yearsExperience?.message}>
            <Input id="yearsExperience" placeholder="Ex: 2 ans, aide familiale, jardinage régulier" {...register("yearsExperience")} />
          </FormField>
          <FormField id="websiteOrInstagram" label="Site ou Instagram (facultatif)" error={errors.websiteOrInstagram?.message}>
            <Input id="websiteOrInstagram" placeholder="https://..." {...register("websiteOrInstagram")} />
          </FormField>
        </div>

        <FormField id="servicesDescription" label="Description" error={errors.servicesDescription?.message}>
          <Textarea
            id="servicesDescription"
            placeholder="Présentez-vous simplement: ce que vous faites bien, votre manière de travailler, vos limites, votre disponibilité."
            className="min-h-32"
            {...register("servicesDescription")}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Paiement et mobilité</h2>
        <FormField id="iban" label="IBAN suisse pour recevoir les paiements" hint="Seuls les IBAN commençant par CH sont acceptés." error={errors.iban?.message}>
          <Input id="iban" placeholder="CH93 0076 2011 6238 5295 7" {...register("iban")} />
        </FormField>

        {agePath === "adult" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="legalStatus" label="Statut" error={errors.legalStatus?.message}>
              <Select value={watch("legalStatus")} onValueChange={(value) => value && setValue("legalStatus", value as ProviderApplicationInput["legalStatus"], { shouldValidate: true })}>
                <SelectTrigger id="legalStatus" className="h-10 w-full rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independant">Indépendant</SelectItem>
                  <SelectItem value="entreprise">Entreprise</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="companyName" label="Raison sociale (facultatif)" error={errors.companyName?.message}>
              <Input id="companyName" placeholder="Ex: ABC Services Sàrl" {...register("companyName")} />
            </FormField>
            <FormField id="ideNumber" label="Numéro IDE (facultatif)" error={errors.ideNumber?.message}>
              <Input id="ideNumber" placeholder="CHE-123.456.789" {...register("ideNumber")} />
            </FormField>
            <FormField id="vatNumber" label="Numéro TVA (facultatif)" error={errors.vatNumber?.message}>
              <Input id="vatNumber" placeholder="CHE-123.456.789 TVA" {...register("vatNumber")} />
            </FormField>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <Checkbox checked={hasDrivingLicense} onCheckedChange={(checked) => setValue("hasDrivingLicense", Boolean(checked), { shouldValidate: true })} />
            <span className="text-sm text-slate-700">J'ai un permis de conduire</span>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <Checkbox checked={watch("hasVehicle")} onCheckedChange={(checked) => setValue("hasVehicle", Boolean(checked), { shouldValidate: true })} />
            <span className="text-sm text-slate-700">J'ai un véhicule disponible</span>
          </label>
        </div>
        {hasDrivingLicense ? (
          <FormField id="drivingLicenseDetails" label="Type de permis" error={errors.drivingLicenseDetails?.message}>
            <Input id="drivingLicenseDetails" placeholder="Ex: permis B" {...register("drivingLicenseDetails")} />
          </FormField>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Identification</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="idDocumentType" label="Document d'identification" error={errors.idDocumentType?.message}>
            <Select value={watch("idDocumentType")} onValueChange={(value) => value && setValue("idDocumentType", value as ProviderApplicationInput["idDocumentType"], { shouldValidate: true })}>
              <SelectTrigger id="idDocumentType" className="h-10 w-full rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piece_identite">Carte d'identité</SelectItem>
                <SelectItem value="permis_conduire">Permis de conduire</SelectItem>
                <SelectItem value="titre_sejour_b">Titre de séjour B</SelectItem>
                <SelectItem value="titre_sejour_c">Titre de séjour C</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {(selectedIdDocType === "titre_sejour_b" || selectedIdDocType === "titre_sejour_c") ? (
            <FormField id="residencePermitType" label="Type du titre" error={errors.residencePermitType?.message}>
              <Select value={watch("residencePermitType")} onValueChange={(value) => value && setValue("residencePermitType", value as ProviderApplicationInput["residencePermitType"], { shouldValidate: true })}>
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

        {selectedIdDocType === "titre_sejour_b" || selectedIdDocType === "titre_sejour_c" ? (
          <FormField id="residencePermit" label="Upload titre de séjour B/C" hint="PDF/JPG/PNG/WEBP, max 8MB.">
            <Input id="residencePermit" type="file" accept={ACCEPTED_DOCUMENTS} onChange={(event) => setPermitFile(event.target.files?.[0] ?? null)} />
          </FormField>
        ) : (
          <FormField id="identityDocument" label="Upload document d'identification" hint="Carte d'identité ou permis de conduire, PDF/JPG/PNG/WEBP, max 8MB.">
            <Input id="identityDocument" type="file" accept={ACCEPTED_DOCUMENTS} onChange={(event) => setIdentityFile(event.target.files?.[0] ?? null)} />
          </FormField>
        )}
      </section>

      {agePath === "junior" ? (
        <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div>
            <h2 className="text-lg font-semibold text-amber-950">Informations parentales</h2>
            <p className="text-sm text-amber-900">Un parent ou représentant légal doit être joignable et signer l'autorisation.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="parentFirstName" label="Prénom du parent" error={errors.parentFirstName?.message}>
              <Input id="parentFirstName" {...register("parentFirstName")} />
            </FormField>
            <FormField id="parentLastName" label="Nom du parent" error={errors.parentLastName?.message}>
              <Input id="parentLastName" {...register("parentLastName")} />
            </FormField>
            <FormField id="parentEmail" label="Email du parent" error={errors.parentEmail?.message}>
              <Input id="parentEmail" type="email" {...register("parentEmail")} />
            </FormField>
            <FormField id="parentPhone" label="Téléphone du parent" error={errors.parentPhone?.message}>
              <Input id="parentPhone" type="tel" {...register("parentPhone")} />
            </FormField>
          </div>

          <FormField id="parentAddressLine" label="Adresse du parent" error={errors.parentAddressLine?.message}>
            <Input id="parentAddressLine" placeholder="Si différente, indiquez l'adresse complète." {...register("parentAddressLine")} />
          </FormField>

          <FormField id="parentAuthorization" label="Autorisation parentale signée" hint="PDF/JPG/PNG/WEBP, max 8MB.">
            <Input id="parentAuthorization" type="file" accept={ACCEPTED_DOCUMENTS} onChange={(event) => setParentAuthorizationFile(event.target.files?.[0] ?? null)} />
          </FormField>

          <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white/70 p-3">
            <Checkbox checked={watch("parentAuthorizationAck")} onCheckedChange={(checked) => setValue("parentAuthorizationAck", Boolean(checked), { shouldValidate: true })} />
            <span className="text-sm text-amber-950">Je confirme que l'autorisation parentale est signée par un représentant légal.</span>
          </label>
          {errors.parentAuthorizationAck?.message ? <p className="text-xs text-destructive">{errors.parentAuthorizationAck.message}</p> : null}

          <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white/70 p-3">
            <Checkbox checked={watch("juniorSafetyAck")} onCheckedChange={(checked) => setValue("juniorSafetyAck", Boolean(checked), { shouldValidate: true })} />
            <span className="text-sm text-amber-950">
              Je comprends que les profils 15-17 ans sont limités aux missions simples, sans travail de nuit, sans charges lourdes et sans travaux dangereux.
            </span>
          </label>
          {errors.juniorSafetyAck?.message ? <p className="text-xs text-destructive">{errors.juniorSafetyAck.message}</p> : null}
        </section>
      ) : null}

      <section className="space-y-3">
        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox checked={watch("acceptsUrgency")} disabled={agePath === "junior"} onCheckedChange={(checked) => setValue("acceptsUrgency", Boolean(checked), { shouldValidate: true })} />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte les interventions urgentes dans la limite de mes disponibilités. Cette option est désactivée pour les 15-17 ans.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox checked={watch("legalResponsibilityAck")} onCheckedChange={(checked) => setValue("legalResponsibilityAck", Boolean(checked), { shouldValidate: true })} />
          <span className="text-sm leading-relaxed text-muted-foreground">
            Je confirme agir sous ma propre responsabilité et rester responsable de mes obligations légales, fiscales, sociales et administratives.
          </span>
        </label>
        {errors.legalResponsibilityAck?.message ? <p className="text-xs text-destructive">{errors.legalResponsibilityAck.message}</p> : null}

        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox checked={watch("termsAck")} onCheckedChange={(checked) => setValue("termsAck", Boolean(checked), { shouldValidate: true })} />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'accepte les conditions prestataires et comprends que la validation PrèsDeToi ne remplace pas mes obligations en Suisse.
          </span>
        </label>
        {errors.termsAck?.message ? <p className="text-xs text-destructive">{errors.termsAck.message}</p> : null}

        <label className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
          <Checkbox checked={watch("consent")} onCheckedChange={(checked) => setValue("consent", Boolean(checked), { shouldValidate: true })} />
          <span className="text-sm leading-relaxed text-muted-foreground">
            J'autorise PrèsDeToi à traiter ce dossier et mes justificatifs, visibles uniquement par les administrateurs autorisés.
          </span>
        </label>
        {errors.consent?.message ? <p className="text-xs text-destructive">{errors.consent.message}</p> : null}
      </section>

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
