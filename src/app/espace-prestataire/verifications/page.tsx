import { ProviderDocumentsPanel } from "@/components/provider/provider-documents-panel";
import { Card } from "@/components/ui/card";
import { requireProviderAccess } from "@/lib/auth";
import { providerWorkflowLabels } from "@/lib/workflow";

export default async function ProviderVerificationsPage() {
  const auth = await requireProviderAccess();
  const workflow = auth.providerApplication?.workflow_status;

  return (
    <div className="space-y-4">
      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Verification d&apos;identite</h2>
        <p className="mt-2 text-sm text-slate-700">
          Statut actuel:{" "}
          <span className="font-semibold">
            {workflow ? providerWorkflowLabels[workflow] ?? workflow : "Dossier non soumis"}
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Les documents sont traites manuellement par l&apos;equipe admin PrèsDeToi.
        </p>
      </Card>
      <ProviderDocumentsPanel />
    </div>
  );
}

