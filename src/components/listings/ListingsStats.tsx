// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/components/listings/ListingsStats.tsx
import type { ListingDTO } from "../../types/listing";

type Props = {
  listings: ListingDTO[];
};

export const ListingsStats: React.FC<Props> = ({ listings }) => {
  const totalListings = listings.length;
  const premierCount = listings.filter((l) => !!l.isPremier).length;
  const avgMedia =
    listings.length > 0
      ? Math.round(
          (listings.reduce((acc, l) => acc + (l.mediaCount || 0), 0) /
            listings.length) *
            10
        ) / 10
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Total de listings
        </p>
        <p className="text-2xl font-semibold text-slate-900">{totalListings}</p>
      </div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-amber-600 mb-1">
          Listings premier
        </p>
        <p className="text-2xl font-semibold text-amber-700">{premierCount}</p>
      </div>
      <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-sky-600 mb-1">
          Media promedio
        </p>
        <p className="text-2xl font-semibold text-sky-700">
          {avgMedia}
          <span className="text-sm font-normal text-sky-600 ml-1">
            fotos/listing
          </span>
        </p>
      </div>
    </div>
  );
};
