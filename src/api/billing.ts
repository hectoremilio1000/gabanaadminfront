// src/api/billing.ts
import api from "./client";

export interface BillingMe {
  plan: {
    slug: "free" | "pro" | "premium";
    name: string;
    priceMxn: number;
    listingsLimit: number;
    featuredLimit: number;
  } | null;
  stripe: {
    customerId: string | null;
    subscriptionId: string | null;
    status: string | null;
    mode: "stub" | "real";
  };
  trialEndsAt: string | null;
}

export async function fetchBillingMe(): Promise<BillingMe> {
  const { data } = await api.get<BillingMe>("/billing/me");
  return data;
}

export async function startCheckout(
  planSlug: "pro" | "premium"
): Promise<{ url: string; mock: boolean }> {
  const { data } = await api.post<{ url: string; mock: boolean }>(
    "/billing/checkout",
    { plan_slug: planSlug }
  );
  return data;
}

export async function openPortal(): Promise<{ url: string; mock: boolean }> {
  const { data } = await api.post<{ url: string; mock: boolean }>(
    "/billing/portal"
  );
  return data;
}
