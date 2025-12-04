// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/api/listingPhotos.ts
import api from "./client";
import type { ListingPhotoDTO } from "../types/listing";

export async function fetchListingPhotos(
  listingId: number
): Promise<ListingPhotoDTO[]> {
  const { data } = await api.get<ListingPhotoDTO[]>(
    `/listings/${listingId}/photos`
  );
  return data;
}

export async function uploadListingPhotos(
  listingId: number,
  files: File[]
): Promise<ListingPhotoDTO[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await api.post<{
    ok: boolean;
    count: number;
    photos: ListingPhotoDTO[];
  }>(`/listings/${listingId}/photos`, formData);

  return data.photos || [];
}

export async function deleteListingPhoto(
  listingId: number,
  photoId: number
): Promise<void> {
  await api.delete(`/listings/${listingId}/photos/${photoId}`);
}
