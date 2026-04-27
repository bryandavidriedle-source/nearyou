"use client";

import { useState } from "react";

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ label: string; lat: number; lng: number }>>([]);

  async function searchLocation(nextQuery: string) {
    setQuery(nextQuery);

    // Extension future: brancher Mapbox Geocoding API ici.
    if (!nextQuery.trim()) {
      setResults([]);
      return;
    }

    setResults([
      { label: `${nextQuery}, Lausanne`, lat: 46.5197, lng: 6.6323 },
    ]);
  }

  return {
    query,
    results,
    searchLocation,
  };
}
