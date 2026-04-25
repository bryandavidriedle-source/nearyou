"use client";

import { SmartNeedSearch } from "@/components/search/smart-need-search";

type SmartSearchBarProps = {
  className?: string;
  initialQuery?: string;
  initialCity?: string;
  submitLabel?: string;
  showSuggestions?: boolean;
};

export function SmartSearchBar(props: SmartSearchBarProps) {
  return <SmartNeedSearch {...props} />;
}
