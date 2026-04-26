// Sprint 1 — Tipos extendidos al modelo MLS rico (Gap #1).
// Conservamos los campos heredados (beds/size como labels, etc.) por
// compatibilidad con la tabla actual; el form ya escribe los campos nuevos.

export type OperationType = "venta" | "renta_larga";
export type PropertyType =
  | "casa"
  | "departamento"
  | "terreno"
  | "local_comercial"
  | "oficina"
  | "nave_industrial"
  | "bodega"
  | "edificio";
export type ListingStatus = "draft" | "published" | "archived";

export type ListingDTO = {
  id: string; // "listing-1"
  slug: string;
  title: string;
  priceLabel: string;
  address: string;
  formattedAddress?: string | null;
  placeId?: string | null;
  zone: string;
  badges: string[];
  highlights: string[];
  mediaCount: number;
  image: string;
  photos?: string[];
  beds: string; // label heredado, p. ej. "3 rec."
  size: string; // label heredado
  isPremier: boolean | 0 | 1;
  isFavorite: boolean;
  coords: { lat: number; lng: number } | null;
  summary: string;

  // Sprint 1 — campos nuevos del modelo MLS
  operationType: OperationType | null;
  propertyType: PropertyType | null;
  bedsCount: number | null;
  bathsCount: number | null;
  parkingCount: number | null;
  m2Built: number | null;
  m2Land: number | null;
  age: number | null;
  amenities: string[];
  state: string | null;
  municipality: string | null;
  colony: string | null;
  price: number;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  agentId: number | null;
};

export type ListingsListMeta = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ListingsListResponse = {
  data: ListingDTO[];
  meta: ListingsListMeta;
};

export type ListingPayload = {
  slug?: string;
  title?: string;
  summary?: string;

  operationType?: OperationType | null;
  propertyType?: PropertyType | null;

  address?: string;
  zone?: string;
  state?: string | null;
  municipality?: string | null;
  colony?: string | null;

  price?: number;
  priceLabel?: string | null;

  beds?: number | null;
  baths?: number | null;
  parking?: number | null;
  m2Built?: number | null;
  m2Land?: number | null;
  age?: number | null;
  amenities?: string[];

  bedsLabel?: string | null;
  sizeLabel?: string | null;
  sizeM2?: number | null;

  isPremier?: boolean;
  isFeatured?: boolean;
  badges?: string[];
  highlights?: string[];

  lat?: number | null;
  lng?: number | null;
  formattedAddress?: string | null;
  placeId?: string | null;

  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  agentId?: number | null;

  status?: ListingStatus;
};

export type ListingPhotoDTO = {
  id: number;
  url: string;
  sortOrder: number;
  isCover: boolean;
};

// Filtros que el sitio público o el admin pueden usar al consultar /api/listings.
export type ListingsSearchParams = {
  operation?: OperationType;
  type?: PropertyType;
  beds_min?: number;
  baths_min?: number;
  parking_min?: number;
  min_price?: number;
  max_price?: number;
  m2_built_min?: number;
  m2_land_min?: number;
  state?: string;
  municipality?: string;
  amenities?: string; // CSV
  q?: string;
  bbox?: string;
  page?: number;
  per_page?: number;
  sort?:
    | "created_at:desc"
    | "created_at:asc"
    | "price:asc"
    | "price:desc"
    | "size:desc"
    | "size:asc"
    | "published_at:desc"
    | "published_at:asc";
  is_featured?: boolean;
};
