export type ListingDTO = {
  id: string; // "listing-1"
  slug: string;
  title: string;
  priceLabel: string;
  address: string;
  zone: string;
  badges: string[];
  highlights: string[];
  mediaCount: number;
  image: string;
  beds: string;
  size: string;
  isPremier: boolean | 0 | 1;
  isFavorite: boolean;
  coords: { lat: number; lng: number } | null;
  summary: string;
};

export type ListingPayload = {
  slug?: string;
  title?: string;
  summary?: string;
  address?: string;
  zone?: string;
  price?: number;
  priceLabel?: string | null;
  bedsLabel?: string | null;
  sizeLabel?: string | null;
  sizeM2?: number | null;
  isPremier?: boolean;
  badges?: string[];
  highlights?: string[];
  lat?: number | null;
  lng?: number | null;
  status?: "draft" | "published" | "archived";
};

export type ListingPhotoDTO = {
  id: number;
  url: string;
  sortOrder: number;
  isCover: boolean;
};
