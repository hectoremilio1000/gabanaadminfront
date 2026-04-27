// src/types/lead.ts
//
// Sprint 2 — Gap #3 (cont.): tipos para el módulo admin de leads.

export type LeadSource = "listing" | "contact_page";
export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "calificado"
  | "descartado"
  | "cerrado";

export interface LeadListingRef {
  id: number;
  slug: string;
  title: string;
}

export interface LeadAgentRef {
  id: number;
  fullName: string;
  email: string;
}

export interface LeadDTO {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  listing: LeadListingRef | null;
  agent: LeadAgentRef | null;
  listingId: number | null;
  agentId: number | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LeadsListResponse {
  data: LeadDTO[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface LeadsSearchParams {
  status?: LeadStatus;
  agent_id?: number;
  listing_id?: number;
  source?: LeadSource;
  q?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  page?: number;
  per_page?: number;
  sort?: "created_at:desc" | "created_at:asc" | "status:asc";
}

export interface UpdateLeadPayload {
  status?: LeadStatus;
  notes?: string | null;
}

export const LEAD_STATUSES: LeadStatus[] = [
  "nuevo",
  "contactado",
  "calificado",
  "descartado",
  "cerrado",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  descartado: "Descartado",
  cerrado: "Cerrado",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  nuevo: "blue",
  contactado: "geekblue",
  calificado: "green",
  descartado: "default",
  cerrado: "purple",
};
