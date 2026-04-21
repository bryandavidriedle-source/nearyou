import { benefits } from "@/lib/constants";

export function WhySection() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {benefits.map((benefit) => (
        <li key={benefit} className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground shadow-sm">
          {benefit}
        </li>
      ))}
    </ul>
  );
}

