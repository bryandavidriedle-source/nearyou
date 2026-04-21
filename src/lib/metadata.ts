import type { Metadata } from "next";

import { pageMetadata } from "@/lib/site";

export function buildMetadata(input: { title: string; description: string; path?: string }): Metadata {
  return pageMetadata(input);
}
