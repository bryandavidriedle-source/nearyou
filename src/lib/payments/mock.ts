export type PaymentProvider = "stripe" | "twint";

export type PaymentIntent = {
  provider: PaymentProvider;
  amountChf: number;
  bookingId: string;
};

export async function createPaymentIntent(input: PaymentIntent) {
  // Architecture prête pour intégration Stripe Connect / TWINT.
  // Implémentation MVP: mock de confirmation contrôlée côté serveur.
  return {
    id: `mock_${input.provider}_${input.bookingId}`,
    status: "pending" as const,
  };
}
