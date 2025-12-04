import { useEffect, useRef, useState } from "react";
import { Button, message, Tag, Empty } from "antd";
import {
  fetchListingPhotos,
  uploadListingPhotos,
  deleteListingPhoto,
} from "../../api/listingPhotos";
import type { ListingDTO, ListingPhotoDTO } from "../../types/listing";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

type Props = {
  listing?: ListingDTO;
  onUpdated?: () => void; // opcional, por si quieres refrescar la tabla desde fuera
};

export const ListingPhotosInline: React.FC<Props> = ({
  listing,
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
    if (numericId) {
      loadPhotos();
    } else {
      setPhotos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericId]);

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!numericId) return;

    const originalFiles = Array.from(event.target.files || []);
    if (originalFiles.length === 0) return;

    // 🔹 Forzar nombre de archivo en minúsculas (para que .PNG → .png)
    const files = originalFiles.map((file) => {
      const lowerName = file.name.toLowerCase();
      if (lowerName === file.name) {
        // ya está en minúsculas, lo regresamos igual
        return file;
      }

      // creamos un nuevo File con el mismo contenido pero nombre en minúsculas
      return new File([file], lowerName, { type: file.type });
    });

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

  if (!listing) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <p className="text-sm text-slate-600 font-medium">
            Fotos del listing
          </p>
          <p className="text-xs text-slate-500">
            Gestiona las fotos de <strong>{listing.title}</strong>. La primera
            foto se usa como portada.
          </p>
          <Tag color="blue" className="mt-1">
            {listing.slug}
          </Tag>
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
            disabled={!numericId}
          >
            Subir fotos
          </Button>
        </div>
      </div>

      {photos.length === 0 && !loading ? (
        <div className="py-6">
          <Empty description="Este listing aún no tiene fotos" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-auto">
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
    </div>
  );
};
