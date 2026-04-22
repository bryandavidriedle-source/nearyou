import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { faqItems } from "@/lib/constants";

export default function FaqPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">FAQ</h1>
        <p className="text-sm text-slate-600">Questions frequentes sur les reservations, prestataires et securite.</p>

        <div className="space-y-3">
          {faqItems.map((item) => (
            <Card key={item.question} className="premium-card p-4">
              <h2 className="text-base font-semibold text-slate-900">{item.question}</h2>
              <p className="mt-2 text-sm text-slate-700">{item.answer}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
