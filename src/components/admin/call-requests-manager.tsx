"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { callbackCategories, callbackSlots } from "@/lib/constants";

type CallRequestStatus = "new" | "pending" | "called" | "closed";
type ContactMode = "phone" | "whatsapp";
type RequestSource = "web" | "phone" | "partner_cafe";

type CallRequestItem = {
  id: string;
  createdAt: string;
  status: CallRequestStatus;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  category: string;
  preferredSlot: string;
  contactMode: ContactMode;
  note: string | null;
  source: RequestSource;
};

type Props = {
  initialRequests: CallRequestItem[];
};

const statuses: CallRequestStatus[] = ["new", "pending", "called", "closed"];

export function CallRequestsManager({ initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState<CallRequestStatus | "all">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingAssist, setSavingAssist] = useState(false);

  const [assistForm, setAssistForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "Lausanne",
    category: "Aide a domicile",
    preferredSlot: "matin",
    contactMode: "phone" as ContactMode,
    note: "",
  });

  const filtered = useMemo(
    () => requests.filter((item) => (statusFilter === "all" ? true : item.status === statusFilter)),
    [requests, statusFilter],
  );

  const todayIso = new Date().toISOString().slice(0, 10);
  const kpiToday = requests.filter((item) => item.createdAt.slice(0, 10) === todayIso).length;
  const kpiPending = requests.filter((item) => item.status === "new" || item.status === "pending").length;
  const kpiCalled = requests.filter((item) => item.status === "called").length;

  async function updateStatus(id: string, status: CallRequestStatus) {
    setSavingId(id);
    const response = await fetch(`/api/admin/call-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    }

    setSavingId(null);
  }

  async function submitAssistForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAssist(true);

    const response = await fetch("/api/call-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...assistForm,
        consent: true,
        source: "phone",
      }),
    });

    if (response.ok) {
      window.location.reload();
      return;
    }

    setSavingAssist(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">Demandes du jour</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{kpiToday}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">En attente</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{kpiPending}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Traitees</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{kpiCalled}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creation assistee par operateur</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submitAssistForm}>
            <div className="space-y-2"><Label>Prenom</Label><Input required value={assistForm.firstName} onChange={(e) => setAssistForm((p) => ({ ...p, firstName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Nom</Label><Input required value={assistForm.lastName} onChange={(e) => setAssistForm((p) => ({ ...p, lastName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Telephone</Label><Input required value={assistForm.phone} onChange={(e) => setAssistForm((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Ville</Label><Input required value={assistForm.city} onChange={(e) => setAssistForm((p) => ({ ...p, city: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Categorie</Label>
              <Select value={assistForm.category} onValueChange={(value) => value && setAssistForm((p) => ({ ...p, category: value }))}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{callbackCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Creneau</Label>
              <Select value={assistForm.preferredSlot} onValueChange={(value) => value && setAssistForm((p) => ({ ...p, preferredSlot: value }))}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{callbackSlots.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={assistForm.contactMode} onValueChange={(value) => value && setAssistForm((p) => ({ ...p, contactMode: value as ContactMode }))}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Appel</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2"><Label>Note interne</Label><Textarea value={assistForm.note} onChange={(e) => setAssistForm((p) => ({ ...p, note: e.target.value }))} /></div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingAssist}>{savingAssist ? "Creation..." : "Creer demande assistee"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Demandes de rappel</CardTitle>
          <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value as CallRequestStatus | "all")}>
            <SelectTrigger className="h-10 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{item.firstName} {item.lastName} - {item.phone}</p>
                  <p className="text-sm text-muted-foreground">{item.city} | {item.category} | {item.preferredSlot} | {item.contactMode}</p>
                  <p className="text-xs text-muted-foreground">source: {item.source} - {new Date(item.createdAt).toLocaleString("fr-CH")}</p>
                  {item.note ? <p className="mt-2 text-sm">Note: {item.note}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={item.status === status ? "default" : "outline"}
                      disabled={savingId === item.id}
                      onClick={() => updateStatus(item.id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune demande pour ce filtre.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
