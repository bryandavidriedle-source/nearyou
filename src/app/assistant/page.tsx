import type { Metadata } from "next";

import { AiAssistant } from "@/components/nearyou/ai-assistant";
import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Assistant PrèsDeToi",
  description: "Assistant IA pour guider les clients et prestataires PrèsDeToi.",
  path: "/assistant",
});

export default function AssistantPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Assistant PrèsDeToi</h1>
        <AiAssistant />
      </Container>
    </section>
  );
}

