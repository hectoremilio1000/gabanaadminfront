// src/api/leads.ts
//
// Sprint 2 — Gap #3 (cont.): cliente para los endpoints admin de leads.

import api from "./client";
import type {
  LeadDTO,
  LeadStatus,
  LeadsListResponse,
  LeadsSearchParams,
  UpdateLeadPayload,
} from "../types/lead";

export async function fetchLeads(
  params?: LeadsSearchParams
): Promise<LeadsListResponse> {
  const { data } = await api.get<LeadsListResponse>("/admin/leads", { params });
  return data;
}

export async function fetchLead(id: number): Promise<LeadDTO> {
  const { data } = await api.get<LeadDTO>(`/admin/leads/${id}`);
  return data;
}

export async function updateLeadStatus(
  id: number,
  status: LeadStatus
): Promise<LeadDTO> {
  const { data } = await api.put<LeadDTO>(`/admin/leads/${id}/status`, {
    status,
  });
  return data;
}

export async function updateLead(
  id: number,
  payload: UpdateLeadPayload
): Promise<LeadDTO> {
  const { data } = await api.put<LeadDTO>(`/admin/leads/${id}`, payload);
  return data;
}
