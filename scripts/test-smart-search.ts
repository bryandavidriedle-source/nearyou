import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_example_key_1234567890";
process.env.NEXT_PUBLIC_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@presdetoi.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "service_role_key_example_1234567890";

async function runSmartSearchUnitTests() {
  const { __smartSearchInternals } = await import("../src/lib/search/smart-search");
  const { SERVICE_CATEGORIES } = await import("../src/lib/catalog");

  const normalized = __smartSearchInternals.normalize("  Déneiger Entrée  ");
  assert.equal(normalized, "deneiger entree");

  const tokens = __smartSearchInternals.tokenize("Montage armoire IKEA en urgence");
  assert.ok(tokens.includes("montage"));
  assert.ok(tokens.includes("urgence"));

  const detectedLocation = __smartSearchInternals.detectSwissLocation(
    "cours informatique pour senior a Nyon 1260",
  );
  assert.equal(detectedLocation.city, "Nyon");
  assert.equal(detectedLocation.postalCode, "1260");

  const detectedTags = __smartSearchInternals.detectTags(
    "j'ai besoin de quelqu'un pour promener mon chien",
    [],
  );
  assert.ok(detectedTags.includes("animaux"));

  for (const query of ["chien", "dog", "prome"]) {
    const tags = __smartSearchInternals.detectTags(query, []);
    assert.ok(tags.includes("animaux"), `${query} should detect animaux`);

    const categoryRows = SERVICE_CATEGORIES.map((category) => ({
      id: category.slug,
      slug: category.slug,
      name_fr: category.label,
      from_price_chf: category.fromPrice,
      ai_search_hint: null,
    }));
    const categorySlugs = __smartSearchInternals.detectCategorySlugs(query, categoryRows, tags, []);
    assert.ok(categorySlugs.includes("promenade-chien"), `${query} should detect promenade-chien`);
  }

  const stPrexToMorges = __smartSearchInternals.distanceKmBetweenCities("St-Prex", "Morges");
  assert.ok(typeof stPrexToMorges === "number" && stPrexToMorges < 12, "Morges should be inside nearby St-Prex search radius");

  console.log("Smart search tests: OK");
}

runSmartSearchUnitTests().catch((error) => {
  console.error(error);
  process.exit(1);
});
