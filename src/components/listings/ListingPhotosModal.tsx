// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/components/listings/ListingPhotosModal.tsx
import { useEffect, useRef, useState } from "react";
import { Modal, Button, message, Tag, Empty } from "antd";
import {
  fetchListingPhotos,
  uploadListingPhotos,
  deleteListingPhoto,
} from "../../api/listingPhotos";
import type { ListingDTO, ListingPhotoDTO } from "../../types/listing";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

type Props = {
  open: boolean;
  listing?: ListingDTO;
  onClose: () => void;
  onUpdated?: () => void; // para refrescar mediaCount en la tabla
};

export const ListingPhotosModal: React.FC<Props> = ({
  open,
  listing,
  onClose,
  onUpdated,
}) => {
  const [photos, setPhotos] = useState<ListingPhotoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const numericId = listing
    ? Number(listing.id.replace("listing-", ""))
    : undefined;

  const loadPhotos = async () => {
    if (!numericId) return;
    try {
      setLoading(true);
      const rows = await fetchListingPhotos(numericId);
      setPhotos(rows);
    } catch (err) {
      console.error(err);
      message.error("No se pudieron cargar las fotos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && numericId) {
      loadPhotos();
    } else if (!open) {
      setPhotos([]);
    }
  }, [open, numericId]);

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!numericId) return;
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      await uploadListingPhotos(numericId, files);
      message.success("Fotos subidas");
      await loadPhotos();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      message.error("No se pudieron subir las fotos");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!numericId) return;
    try {
      await deleteListingPhoto(numericId, photoId);
      message.success("Foto eliminada");
      await loadPhotos();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      message.error("No se pudo eliminar la foto");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={listing ? `Fotos de ${listing.title}` : "Fotos del listing"}
      width={720}
      destroyOnClose
    >
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <p className="text-sm text-slate-600">
            Gestiona las fotos del listing. La primera foto subida se usará como
            portada automáticamente.
          </p>
          <Tag color="blue">{listing?.slug}</Tag>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFilesSelected}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            type="primary"
            className="!rounded-full"
          >
            Subir fotos
          </Button>
        </div>
      </div>

      {photos.length === 0 && !loading ? (
        <div className="py-8">
          <Empty description="Este listing aún no tiene fotos" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-50">
                  #{photo.sortOrder}
                </span>
                {photo.isCover && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 font-medium">
                    Portada
                  </span>
                )}
              </div>
              <button
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeletePhoto(photo.id)}
              >
                <DeleteOutlined className="text-red-500 text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
