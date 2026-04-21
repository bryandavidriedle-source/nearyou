import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center") }>
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary/80">{eyebrow}</p>
      ) : null}
      <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {description ? (
        <p className={cn("mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base", align === "center" && "mx-auto")}>{description}</p>
      ) : null}
      {action ? <div className={cn("mt-5", align === "center" && "flex justify-center")}>{action}</div> : null}
    </div>
  );
}

