// src/api/listings.ts
import api from "./client";
import type { ListingDTO, ListingPayload } from "../types/listing";

export async function fetchListings(): Promise<ListingDTO[]> {
  const { data } = await api.get<ListingDTO[]>("/listings");
  return data;
}

export async function fetchListingBySlug(slug: string): Promise<ListingDTO> {
  const { data } = await api.get<ListingDTO>(`/listings/${slug}`);
  return data;
}

export async function createListing(
  payload: ListingPayload
): Promise<ListingDTO> {
  const { data } = await api.post<ListingDTO>("/listings", payload);
  return data;
}

export async function updateListing(
  id: number,
  payload: ListingPayload
): Promise<ListingDTO> {
  const { data } = await api.put<ListingDTO>(`/listings/${id}`, payload);
  return data;
}

export async function deleteListing(id: number): Promise<void> {
  await api.delete(`/listings/${id}`);
}
