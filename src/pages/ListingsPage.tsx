// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/pages/ListingsPage.tsx
import { useEffect, useState, useCallback } from "react";
import { message } from "antd";
import { fetchListings, deleteListing } from "../api/listings";
import type { ListingDTO } from "../types/listing";
import { ListingsHeader } from "../components/listings/ListingsHeader";
import { ListingsStats } from "../components/listings/ListingsStats";
import { ListingsTable } from "../components/listings/ListingsTable";
import { ListingModal } from "../components/listings/ListingModal";
import { ListingPhotosModal } from "../components/listings/ListingPhotosModal";

export default function ListingsPage() {
  const [data, setData] = useState<ListingDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingListing, setEditingListing] = useState<ListingDTO | null>(null);

  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [photosListing, setPhotosListing] = useState<ListingDTO | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await fetchListings();
      setData(rows);
    } catch (err) {
      console.error(err);
      message.error("Error cargando listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (idStr: string) => {
    const id = Number(idStr.replace("listing-", ""));
    try {
      await deleteListing(id);
      message.success("Listing eliminado");
      load();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.error || "No se pudo eliminar");
    }
  };

  const handleCreateClick = () => {
    setModalMode("create");
    setEditingListing(null);
    setModalOpen(true);
  };

  const handleEditClick = (listing: ListingDTO) => {
    // 1) Abrimos el modal de edición con la info del listing
    setModalMode("edit");
    setEditingListing(listing);
    setModalOpen(true);

    // 2) Al mismo tiempo abrimos el modal de fotos para ese mismo listing
    // setPhotosListing(listing);
    // setPhotosModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSuccess = (listing: ListingDTO) => {
    setModalOpen(false);
    load();

    // Siempre que se guarda (crear o editar) abrimos el modal de fotos
    setPhotosListing(listing);
    setPhotosModalOpen(true);
  };

  const handlePhotosClose = () => {
    setPhotosModalOpen(false);
    setPhotosListing(null);
  };

  return (
    <div className="space-y-6">
      <ListingsHeader
        loading={loading}
        onRefresh={load}
        onCreateListing={handleCreateClick}
      />

      <ListingsStats listings={data} />

      <ListingsTable
        data={data}
        loading={loading}
        onDelete={handleDelete}
        onEdit={handleEditClick}
      />

      <ListingModal
        open={modalOpen}
        mode={modalMode}
        listing={editingListing || undefined}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
