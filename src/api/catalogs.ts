// src/api/catalogs.ts — Sprint 1, Gap #1.
// Endpoints públicos de catálogos para que el form admin tenga selects/multiselects
// alimentados desde la BD en lugar de hardcodear listas.

import api from "./client";

export type StateOption = {
  id: number;
  code: string;
  name: string;
  slug: string;
};

export type MunicipalityOption = {
  id: number;
  name: string;
  slug: string;
};

export type AmenityOption = {
  id: number;
  slug: string;
  label: string;
  category:
    | "exterior"
    | "interior"
    | "deportivo"
    | "servicios"
    | "comun"
    | "ubicacion";
};

export async function fetchStates(): Promise<StateOption[]> {
  const { data } = await api.get<{ data: StateOption[] }>("/states");
  return data.data;
}

export async function fetchMunicipalitiesByState(
  stateId: number
): Promise<MunicipalityOption[]> {
  const { data } = await api.get<{ data: MunicipalityOption[] }>(
    `/states/${stateId}/municipalities`
  );
  return data.data;
}

export async function fetchAmenities(): Promise<AmenityOption[]> {
  const { data } = await api.get<{ data: AmenityOption[] }>("/amenities");
  return data.data;
}
