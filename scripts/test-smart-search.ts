import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_example_key_1234567890";
process.env.NEXT_PUBLIC_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@presdetoi.com";
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "service_role_key_example_1234567890";

async function runSmartSearchUnitTests() {
  const { __smartSearchInternals } = await import("../src/lib/search/smart-search");

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

  console.log("Smart search tests: OK");
}

runSmartSearchUnitTests().catch((error) => {
  console.error(error);
  process.exit(1);
});
