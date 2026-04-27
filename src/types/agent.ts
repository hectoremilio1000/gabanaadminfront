// src/types/agent.ts
//
// Sprint 4 — Gap #7/#8: tipos para módulo de verificación de agentes.

export type AgentDocumentType =
  | "rfc"
  | "ine_frontal"
  | "ine_reverso"
  | "foto_perfil"
  | "cedula_rpp";

export type AgentDocumentStatus = "pendiente" | "aprobado" | "rechazado";

export interface AgentDocumentDTO {
  id: number;
  type: AgentDocumentType;
  fileUrl: string;
  status: AgentDocumentStatus;
  uploadedAt: string | null;
}

export interface PendingAgentDTO {
  id: number;
  fullName: string;
  email: string;
  slug: string | null;
  photoUrl: string | null;
  bio: string | null;
  whatsapp: string | null;
  phonePublic: string | null;
  verificationStatus: "pending" | "approved" | "rejected";
  createdAt: string | null;
  plan: { slug: string; name: string } | null;
  documents: AgentDocumentDTO[];
}

export const AGENT_DOC_LABELS: Record<AgentDocumentType, string> = {
  rfc: "RFC",
  ine_frontal: "INE (frente)",
  ine_reverso: "INE (reverso)",
  foto_perfil: "Foto de perfil",
  cedula_rpp: "Cédula RPP",
};
