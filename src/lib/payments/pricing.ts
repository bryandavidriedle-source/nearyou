import { siteConfig } from "@/lib/site";

export type PaymentBreakdown = {
  totalChf: number;
  platformFeeChf: number;
  providerNetChf: number;
  commissionRate: number;
};

export function computeSwissMarketplaceBreakdown(totalChf: number, commissionRate = siteConfig.commissionRate): PaymentBreakdown {
  const safeTotal = Math.max(0, Math.round(totalChf));
  const fee = Math.round(safeTotal * commissionRate);
  const providerNet = Math.max(0, safeTotal - fee);

  return {
    totalChf: safeTotal,
    platformFeeChf: fee,
    providerNetChf: providerNet,
    commissionRate,
  };
}
