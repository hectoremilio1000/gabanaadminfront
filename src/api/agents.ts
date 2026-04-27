// src/api/agents.ts
import api from "./client";
import type { PendingAgentDTO } from "../types/agent";

export async function fetchPendingAgents(): Promise<PendingAgentDTO[]> {
  const { data } = await api.get<PendingAgentDTO[]>("/admin/agents/pending");
  return data;
}

export async function approveAgent(id: number): Promise<void> {
  await api.post(`/admin/agents/${id}/approve`);
}

export async function rejectAgent(id: number, reason: string): Promise<void> {
  await api.post(`/admin/agents/${id}/reject`, { reason });
}
