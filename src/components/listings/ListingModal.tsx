import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  message,
  Divider,
} from "antd";
import type { ListingDTO, ListingPayload } from "../../types/listing";
import { createListing, updateListing } from "../../api/listings";
import { ListingPhotosInline } from "./ListingPhotosInline";
import { useGoogleMaps } from "../../hooks/useGoogleMaps";
import type { InputRef } from "antd";
import { getCurrentUser } from "../../api/auth";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  listing?: ListingDTO;
  onClose: () => void;
  onSuccess: (listing: ListingDTO) => void;
};

export const ListingModal: React.FC<Props> = ({
  open,
  mode,
  listing,
  onClose,
  onSuccess,
}) => {
  const currentUser = getCurrentUser();
  const isSuperadmin = currentUser?.role === "superadmin";
  const useMockMaps =
    (import.meta.env.VITE_USE_MOCK_MAPS as string | undefined) === "1" ||
    (import.meta.env.VITE_USE_MOCK_MAPS as string | undefined) === "true";

  const [form] = Form.useForm();
  const [mapError, setMapError] = useState<string | null>(null);
  const [mockSuggestions, setMockSuggestions] = useState<string[]>([]);

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const { ready: mapsReady, error: mapsLoadError } = useGoogleMaps(
    googleMapsKey,
    ["places"],
    !useMockMaps
  );

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const addressInputRef = useRef<InputRef | null>(null);

  const defaultCenter = useMemo(
    () => ({
      lat: listing?.coords?.lat ?? 19.4326, // CDMX por defecto
      lng: listing?.coords?.lng ?? -99.1332,
    }),
    [listing?.coords?.lat, listing?.coords?.lng]
  );

  const updateMarkerPosition = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setPosition({ lat, lng });
    mapInstanceRef.current.panTo({ lat, lng });
  };

  const setLatLng = (lat: number, lng: number) => {
    form.setFieldsValue({ lat, lng });
    updateMarkerPosition(lat, lng);
  };

  const slugify = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleAddressChange = (value: string) => {
    if (!useMockMaps) return;
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setMockSuggestions([]);
      return;
    }
    const base = trimmed.length > 30 ? `${trimmed.slice(0, 30)}…` : trimmed;
    setMockSuggestions([
      `${base} - Polanco`,
      `${base} - Roma Norte`,
      `${base} - Condesa`,
    ]);
  };

  const handleMockSelect = (label: string) => {
    const lat = 19.4326 + Math.random() * 0.01;
    const lng = -99.1332 + Math.random() * 0.01;
    form.setFieldsValue({
      address: label,
      formattedAddress: label,
      placeId: `mock-${slugify(label)}`,
      lat,
      lng,
    });
    setMockSuggestions([]);
  };

  const initMap = () => {
    if (useMockMaps) return;
    if (!mapsReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const g = (window as any).google;
    if (!g?.maps) return;

    const center = {
      lat: form.getFieldValue("lat") ?? defaultCenter.lat,
      lng: form.getFieldValue("lng") ?? defaultCenter.lng,
    };

    const map = new g.maps.Map(mapContainerRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    const marker = new g.maps.Marker({
      position: center,
      map,
      draggable: true,
    });

    map.addListener("click", (ev: any) => {
      const lat = ev.latLng.lat();
      const lng = ev.latLng.lng();
      setLatLng(lat, lng);
    });

    marker.addListener("dragend", (ev: any) => {
      const lat = ev.latLng.lat();
      const lng = ev.latLng.lng();
      setLatLng(lat, lng);
    });

    const inputEl = addressInputRef.current?.input;
    if (inputEl) {
      const autocomplete = new g.maps.places.Autocomplete(inputEl, {
        fields: ["formatted_address", "geometry", "place_id", "name"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const loc = place.geometry?.location;
        if (!loc) {
          setMapError("Selecciona una opción del autocompletado");
          return;
        }
        const lat = loc.lat();
        const lng = loc.lng();
        form.setFieldsValue({
          address: place.name || place.formatted_address || form.getFieldValue("address"),
          formattedAddress: place.formatted_address ?? null,
          placeId: place.place_id ?? null,
          lat,
          lng,
        });
        setMapError(null);
        updateMarkerPosition(lat, lng);
      });
      autocompleteRef.current = autocomplete;
    }

    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && listing) {
      form.setFieldsValue({
        title: listing.title,
        summary: listing.summary,
        address: listing.address,
        formattedAddress: listing.formattedAddress ?? listing.address,
        placeId: listing.placeId ?? null,
        zone: listing.zone,
        price: undefined, // no viene el price numérico en el DTO
        bedsLabel: listing.beds || "",
        sizeLabel: listing.size || "",
        isPremier: isSuperadmin ? !!listing.isPremier : listing.isPremier ?? false,
        status: "published",
        lat: listing.coords?.lat ?? null,
        lng: listing.coords?.lng ?? null,
      });
    } else {
      form.resetFields();
    }
  }, [open, mode, listing, form]);

  useEffect(() => {
    if (!open) {
      // Al cerrar, permitimos re-crear el mapa en el próximo open
      mapInstanceRef.current = null;
      markerRef.current = null;
      autocompleteRef.current = null;
      setMockSuggestions([]);
      return;
    }
    if (mapsReady) {
      initMap();
    }
  }, [mapsReady, open]);

  useEffect(() => {
    if (mapsLoadError) {
      if (useMockMaps) return;
      setMapError(mapsLoadError);
    }
  }, [mapsLoadError, useMockMaps]);

  useEffect(() => {
    if (useMockMaps) return;
    if (!mapsReady || !mapInstanceRef.current) return;
    const lat = form.getFieldValue("lat");
    const lng = form.getFieldValue("lng");
    if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      updateMarkerPosition(lat, lng);
    } else {
      updateMarkerPosition(defaultCenter.lat, defaultCenter.lng);
    }
  }, [open, listing, mapsReady, form, defaultCenter.lat, defaultCenter.lng, useMockMaps]);

  const handleSubmit = async (values: any) => {
    const baseSlug = slugify(values.title) || `listing-${Date.now()}`;
    const isPremier = isSuperadmin
      ? values.isPremier ?? false
      : listing?.isPremier ?? false;
    const payload: ListingPayload = {
      slug: mode === "edit" && listing ? listing.slug : baseSlug,
      title: values.title,
      summary: values.summary,
      address: values.address,
      formattedAddress: values.formattedAddress ?? null,
      placeId: values.placeId ?? null,
      zone: values.zone,
      price: values.price ?? undefined,
      bedsLabel: values.bedsLabel || null,
      sizeLabel: values.sizeLabel || null,
      isPremier,
      lat: values.lat ?? null,
      lng: values.lng ?? null,
      status: values.status,
    };

    try {
      if (mode === "create") {
        try {
          const created = await createListing(payload);
          message.success("Listing creado");
          onSuccess(created);
          return;
        } catch (err: any) {
          const isConflict = err?.response?.status === 409;
          if (!isConflict) throw err;

          // reintenta con sufijo para garantizar unicidad sin pedir slug al usuario
          const retryPayload = {
            ...payload,
            slug: `${baseSlug}-${Date.now().toString(36).slice(-4)}`,
          };
          const created = await createListing(retryPayload);
          message.success("Listing creado (slug ajustado automáticamente)");
          onSuccess(created);
        }
      } else if (mode === "edit" && listing) {
        const numericId = Number(listing.id.replace("listing-", ""));
        const updated = await updateListing(numericId, payload);
        message.success("Listing actualizado");
        onSuccess(updated);
      }
    } catch (err: any) {
      console.error(err);
      message.error(
        err?.response?.data?.error || "No se pudo guardar el listing"
      );
    }
  };

  const title = mode === "create" ? "Nuevo listing" : "Editar listing";

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      okText={mode === "create" ? "Crear" : "Guardar cambios"}
      onOk={() => form.submit()}
      destroyOnHidden
      width={800}
    >
      {/* 🔹 Parte de arriba: datos del listing */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isPremier: isSuperadmin ? false : undefined,
          bedsLabel: "",
          sizeLabel: "",
          status: "published",
          lat: null,
          lng: null,
        }}
      >
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: "Ingresa el título" }]}
        >
          <Input placeholder="Departamento en Polanco" />
        </Form.Item>

        <Form.Item
          label="Resumen"
          name="summary"
          rules={[{ required: true, message: "Ingresa un resumen" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Dirección"
          name="address"
          rules={[{ required: true, message: "Ingresa la dirección" }]}
        >
          <Input
            ref={addressInputRef}
            placeholder="Busca en Google Maps"
            onChange={(e) => handleAddressChange(e.target.value)}
            suffix={<span className="text-[11px] text-slate-400">Autocomplete</span>}
          />
        </Form.Item>

        {useMockMaps && mockSuggestions.length > 0 && (
          <div className="pac-container border border-slate-200 rounded-lg shadow-sm mb-4 overflow-hidden">
            {mockSuggestions.map((sugg) => (
              <div
                key={sugg}
                className="pac-item cursor-pointer px-3 py-2 hover:bg-slate-50 text-sm"
                onClick={() => handleMockSelect(sugg)}
              >
                <span className="pac-item-query">{sugg}</span>
              </div>
            ))}
          </div>
        )}

        <Form.Item label="Dirección formateada (Google)" name="formattedAddress">
          <Input placeholder="Se llenará al elegir en el mapa" />
        </Form.Item>

        <Form.Item name="placeId" label="Place ID" tooltip="Identificador de Google Places">
          <Input placeholder="Se llenará automáticamente" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item label="Latitud" name="lat">
            <InputNumber className="w-full" placeholder="19.4326" />
          </Form.Item>
          <Form.Item label="Longitud" name="lng">
            <InputNumber className="w-full" placeholder="-99.1332" />
          </Form.Item>
          <div className="flex items-end">
            <p className="text-xs text-slate-500">
              Selecciona en el autocomplete o mueve el pin en el mapa.
            </p>
          </div>
        </div>

        <Form.Item
          label="Zona"
          name="zone"
          rules={[{ required: true, message: "Ingresa la zona" }]}
        >
          <Input placeholder="Polanco, Bosques, etc." />
        </Form.Item>

        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-slate-700">Mapa</p>
          <p className="text-xs text-slate-500">
            Usa el buscador o haz clic en el mapa para fijar ubicación (Google Maps Places).
          </p>
          {mapError && <p className="text-xs text-red-500">{mapError}</p>}
          {!googleMapsKey && !useMockMaps && (
            <p className="text-xs text-red-500">
              Falta VITE_GOOGLE_MAPS_API_KEY en el front para cargar el mapa.
            </p>
          )}
          {useMockMaps ? (
            <div className="w-full h-64 rounded-xl border border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center text-xs text-slate-500">
              Modo mock: sin mapa real, solo autocomplete simulado para pruebas.
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              className="w-full h-64 rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item label="Precio" name="price">
            <InputNumber
              className="w-full"
              min={0}
              step={100000}
              placeholder="35000000"
            />
          </Form.Item>

          {isSuperadmin && (
            <Form.Item label="Premier" name="isPremier" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item label="Recámaras" name="bedsLabel">
            <Input placeholder="3 recámaras" />
          </Form.Item>
          <Form.Item label="Tamaño" name="sizeLabel">
            <Input placeholder="250 m²" />
          </Form.Item>
        </div>

        <Form.Item label="Estatus" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "draft", label: "Borrador" },
              { value: "published", label: "Publicado" },
              { value: "archived", label: "Archivado" },
            ]}
          />
        </Form.Item>
      </Form>

      {/* 🔹 Parte de abajo: fotos (solo en modo edición) */}
      {mode === "edit" && listing && (
        <>
          <Divider />
          <ListingPhotosInline listing={listing} />
        </>
      )}
    </Modal>
  );
};
