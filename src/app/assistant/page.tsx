import type { Metadata } from "next";

import { AiAssistant } from "@/components/nearyou/ai-assistant";
import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Assistant NearYou",
  description: "Assistant IA pour guider les clients et prestataires NearYou.",
  path: "/assistant",
});

export default function AssistantPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl">
        <AiAssistant />
      </Container>
    </section>
  );
}
