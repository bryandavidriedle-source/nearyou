import { faqItems } from "@/lib/constants";

export function FAQSection() {
  return (
    <div className="space-y-3">
      {faqItems.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-border/80 bg-card p-5 shadow-sm open:border-primary/40"
        >
          <summary className="cursor-pointer list-none pr-8 text-sm font-medium text-foreground sm:text-base">
            {item.question}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

