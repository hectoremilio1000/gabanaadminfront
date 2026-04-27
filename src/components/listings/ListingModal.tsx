/* eslint-disable @typescript-eslint/no-explicit-any --
 * Google Maps SDK types are not installed (no @types/google.maps). Las refs
 * del mapa, el autocomplete y los payloads del Form de antd se tipan como
 * `any`. Se difiere a Sprint 7 (limpieza de calidad) instalar los typings y
 * sustituir todos los `any`. */
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
import type {
  ListingDTO,
  ListingPayload,
  OperationType,
  PropertyType,
} from "../../types/listing";
import { createListing, updateListing } from "../../api/listings";
import {
  fetchAmenities,
  fetchMunicipalitiesByState,
  fetchStates,
  type AmenityOption,
  type MunicipalityOption,
  type StateOption,
} from "../../api/catalogs";
import { fetchUsers } from "../../api/users";
import type { UserDTO } from "../../types/auth";
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

const OPERATION_OPTIONS: Array<{ value: OperationType; label: string }> = [
  { value: "venta", label: "Venta" },
  { value: "renta_larga", label: "Renta larga (6-12 meses)" },
];

const PROPERTY_TYPE_OPTIONS: Array<{ value: PropertyType; label: string }> = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "terreno", label: "Terreno / Lote" },
  { value: "local_comercial", label: "Local comercial" },
  { value: "oficina", label: "Oficina" },
  { value: "nave_industrial", label: "Nave industrial" },
  { value: "bodega", label: "Bodega" },
  { value: "edificio", label: "Edificio" },
];

/** Tipos donde NO aplican beds/baths/parking (terrenos, naves vacías). */
const NO_BEDS_TYPES: PropertyType[] = ["terreno"];

export const ListingModal: React.FC<Props> = ({
  open,
  mode,
  listing,
  onClose,
  onSuccess,
}) => {
  const currentUser = getCurrentUser() as UserDTO | null;
  const isAdmin =
    currentUser?.role === "superadmin" || currentUser?.role === "staff";
  const isSuperadmin = currentUser?.role === "superadmin";

  const useMockMaps =
    (import.meta.env.VITE_USE_MOCK_MAPS as string | undefined) === "1" ||
    (import.meta.env.VITE_USE_MOCK_MAPS as string | undefined) === "true";

  const [form] = Form.useForm();
  const [mapError, setMapError] = useState<string | null>(null);
  const [mockSuggestions, setMockSuggestions] = useState<string[]>([]);

  // ── Catálogos (Sprint 1) ──────────────────────────────────────────────
  const [states, setStates] = useState<StateOption[]>([]);
  const [municipalities, setMunicipalities] = useState<MunicipalityOption[]>(
    []
  );
  const [amenities, setAmenities] = useState<AmenityOption[]>([]);
  const [agents, setAgents] = useState<UserDTO[]>([]);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(
    listing?.propertyType ?? null
  );

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
    | string
    | undefined;
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
      lat: listing?.coords?.lat ?? 19.4326,
      lng: listing?.coords?.lng ?? -99.1332,
    }),
    [listing?.coords?.lat, listing?.coords?.lng]
  );

  // ── Cargar catálogos al abrir ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [statesData, amenitiesData] = await Promise.all([
          fetchStates(),
          fetchAmenities(),
        ]);
        if (cancelled) return;
        setStates(statesData);
        setAmenities(amenitiesData);

        if (isAdmin) {
          try {
            const users = await fetchUsers();
            if (!cancelled) {
              setAgents(users.filter((u) => u.role === "publisher"));
            }
          } catch {
            // si /users falla, simplemente no hay selector de agente
          }
        }
      } catch (err) {
        console.error("No se pudieron cargar catálogos", err);
        message.error("No se pudieron cargar los catálogos");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isAdmin]);

  // ── Cargar municipios cuando cambia el estado ─────────────────────────
  const loadMunicipalitiesFor = async (stateName: string | null) => {
    if (!stateName) {
      setMunicipalities([]);
      return;
    }
    const state = states.find((s) => s.name === stateName);
    if (!state) {
      setMunicipalities([]);
      return;
    }
    try {
      const munis = await fetchMunicipalitiesByState(state.id);
      setMunicipalities(munis);
    } catch (err) {
      console.error("No se pudieron cargar municipios", err);
      setMunicipalities([]);
    }
  };

  // ── Map helpers (heredados, sin cambios) ──────────────────────────────
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
      .replace(/[̀-ͯ]/g, "")
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
    const base =
      trimmed.length > 30 ? `${trimmed.slice(0, 30)}…` : trimmed;
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
    if (!mapsReady || !mapContainerRef.current || mapInstanceRef.current)
      return;
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
          address:
            place.name ||
            place.formatted_address ||
            form.getFieldValue("address"),
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

  // ── Inicializar valores del form al abrir ─────────────────────────────
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && listing) {
      const initialState = listing.state ?? null;
      form.setFieldsValue({
        title: listing.title,
        summary: listing.summary,
        operationType: listing.operationType,
        propertyType: listing.propertyType,
        address: listing.address,
        formattedAddress: listing.formattedAddress ?? listing.address,
        placeId: listing.placeId ?? null,
        zone: listing.zone,
        state: initialState,
        municipality: listing.municipality,
        colony: listing.colony,
        price: listing.price ?? undefined,
        beds: listing.bedsCount ?? undefined,
        baths: listing.bathsCount ?? undefined,
        parking: listing.parkingCount ?? undefined,
        m2Built: listing.m2Built ?? undefined,
        m2Land: listing.m2Land ?? undefined,
        age: listing.age ?? undefined,
        amenities: listing.amenities ?? [],
        videoUrl: listing.videoUrl ?? null,
        virtualTourUrl: listing.virtualTourUrl ?? null,
        agentId: listing.agentId ?? null,
        bedsLabel: listing.beds || "",
        sizeLabel: listing.size || "",
        isPremier: !!listing.isPremier,
        isFeatured: !!listing.isFeatured,
        status: "published",
        lat: listing.coords?.lat ?? null,
        lng: listing.coords?.lng ?? null,
      });
      setPropertyType(listing.propertyType);
      if (initialState) loadMunicipalitiesFor(initialState);
    } else {
      form.resetFields();
      setPropertyType(null);
      setMunicipalities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, listing, form, states.length]);

  useEffect(() => {
    if (!open) {
      mapInstanceRef.current = null;
      markerRef.current = null;
      autocompleteRef.current = null;
      setMockSuggestions([]);
      return;
    }
    if (mapsReady) {
      initMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [
    open,
    listing,
    mapsReady,
    form,
    defaultCenter.lat,
    defaultCenter.lng,
    useMockMaps,
  ]);

  const handlePropertyTypeChange = (value: PropertyType) => {
    setPropertyType(value);
    if (NO_BEDS_TYPES.includes(value)) {
      form.setFieldsValue({ beds: null, baths: null, parking: null, age: null });
    }
  };

  const handleStateChange = (value: string | null) => {
    form.setFieldsValue({ municipality: null });
    loadMunicipalitiesFor(value);
  };

  const handleSubmit = async (values: any) => {
    const baseSlug = slugify(values.title) || `listing-${Date.now()}`;
    const isPremier = isAdmin
      ? values.isPremier ?? false
      : listing?.isPremier ?? false;
    const isFeatured = isAdmin
      ? values.isFeatured ?? false
      : !!listing?.isFeatured;

    // labels heredados auto-generados si el admin no los llenó.
    const bedsLabel =
      values.bedsLabel ||
      (values.beds ? `${values.beds} rec.` : null);
    const sizeLabel =
      values.sizeLabel ||
      (values.m2Built
        ? `${values.m2Built} m² const.${values.m2Land ? ` · ${values.m2Land} m² terreno` : ""}`
        : values.m2Land
          ? `${values.m2Land} m² terreno`
          : null);

    const payload: ListingPayload = {
      slug: mode === "edit" && listing ? listing.slug : baseSlug,
      title: values.title,
      summary: values.summary,
      operationType: values.operationType,
      propertyType: values.propertyType,
      address: values.address,
      formattedAddress: values.formattedAddress ?? null,
      placeId: values.placeId ?? null,
      zone: values.zone,
      state: values.state ?? null,
      municipality: values.municipality ?? null,
      colony: values.colony ?? null,
      price: values.price ?? undefined,
      beds: values.beds ?? null,
      baths: values.baths ?? null,
      parking: values.parking ?? null,
      m2Built: values.m2Built ?? null,
      m2Land: values.m2Land ?? null,
      age: values.age ?? null,
      amenities: values.amenities ?? [],
      bedsLabel,
      sizeLabel,
      sizeM2: values.m2Built
        ? Math.round(Number(values.m2Built))
        : values.m2Land
          ? Math.round(Number(values.m2Land))
          : null,
      isPremier,
      isFeatured,
      lat: values.lat ?? null,
      lng: values.lng ?? null,
      videoUrl: values.videoUrl ?? null,
      virtualTourUrl: values.virtualTourUrl ?? null,
      agentId: isAdmin ? values.agentId ?? null : undefined,
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

  const showBedsBaths = !propertyType || !NO_BEDS_TYPES.includes(propertyType);
  const titleText = mode === "create" ? "Nuevo listing" : "Editar listing";

  return (
    <Modal
      open={open}
      title={titleText}
      onCancel={onClose}
      okText={mode === "create" ? "Crear" : "Guardar cambios"}
      onOk={() => form.submit()}
      destroyOnHidden
      width={920}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isPremier: false,
          isFeatured: false,
          bedsLabel: "",
          sizeLabel: "",
          status: "published",
          amenities: [],
          lat: null,
          lng: null,
        }}
      >
        {/* ── Identificación y clasificación MLS ──────────────────────── */}
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: "Ingresa el título" }]}
        >
          <Input placeholder="Casa en Polanco con jardín privado" />
        </Form.Item>

        <Form.Item
          label="Resumen"
          name="summary"
          rules={[{ required: true, message: "Ingresa un resumen" }]}
        >
          <Input.TextArea rows={3} maxLength={500} showCount />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label="Operación"
            name="operationType"
            rules={[{ required: true, message: "Selecciona operación" }]}
          >
            <Select
              options={OPERATION_OPTIONS}
              placeholder="Venta o renta larga"
            />
          </Form.Item>
          <Form.Item
            label="Tipo de propiedad"
            name="propertyType"
            rules={[{ required: true, message: "Selecciona tipo" }]}
          >
            <Select
              options={PROPERTY_TYPE_OPTIONS}
              placeholder="Casa, departamento, terreno…"
              onChange={handlePropertyTypeChange}
            />
          </Form.Item>
        </div>

        {/* ── Atributos numéricos ─────────────────────────────────────── */}
        {showBedsBaths && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item label="Recámaras" name="beds">
              <InputNumber className="w-full" min={0} max={20} placeholder="3" />
            </Form.Item>
            <Form.Item label="Baños" name="baths">
              <InputNumber
                className="w-full"
                min={0}
                max={20}
                step={0.5}
                placeholder="2.5"
              />
            </Form.Item>
            <Form.Item label="Estacionamientos" name="parking">
              <InputNumber className="w-full" min={0} max={20} placeholder="2" />
            </Form.Item>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item label="m² construidos" name="m2Built">
            <InputNumber className="w-full" min={0} placeholder="320" />
          </Form.Item>
          <Form.Item label="m² terreno" name="m2Land">
            <InputNumber className="w-full" min={0} placeholder="280" />
          </Form.Item>
          {showBedsBaths && (
            <Form.Item label="Antigüedad (años)" name="age">
              <InputNumber className="w-full" min={0} max={200} placeholder="8" />
            </Form.Item>
          )}
        </div>

        <Form.Item label="Amenidades" name="amenities">
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Alberca, gym, jardín, seguridad 24h…"
            options={amenities.map((a) => ({
              value: a.slug,
              label: a.label,
            }))}
          />
        </Form.Item>

        <Divider titlePlacement="start" plain>
          Ubicación
        </Divider>

        <Form.Item
          label="Dirección"
          name="address"
          rules={[{ required: true, message: "Ingresa la dirección" }]}
        >
          <Input
            ref={addressInputRef}
            placeholder="Busca en Google Maps"
            onChange={(e) => handleAddressChange(e.target.value)}
            suffix={
              <span className="text-[11px] text-slate-400">Autocomplete</span>
            }
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

        <Form.Item
          label="Dirección formateada (Google)"
          name="formattedAddress"
        >
          <Input placeholder="Se llenará al elegir en el mapa" />
        </Form.Item>

        <Form.Item
          name="placeId"
          label="Place ID"
          tooltip="Identificador de Google Places"
        >
          <Input placeholder="Se llenará automáticamente" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item label="Estado" name="state">
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              onChange={handleStateChange}
              options={states.map((s) => ({ value: s.name, label: s.name }))}
              placeholder="Ciudad de México, Jalisco…"
            />
          </Form.Item>
          <Form.Item label="Municipio / Alcaldía" name="municipality">
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              options={municipalities.map((m) => ({
                value: m.name,
                label: m.name,
              }))}
              placeholder="Selecciona estado primero"
              disabled={!municipalities.length}
            />
          </Form.Item>
          <Form.Item label="Colonia / Fraccionamiento" name="colony">
            <Input placeholder="Polanco IV, Cholul…" />
          </Form.Item>
        </div>

        <Form.Item
          label="Zona / Etiqueta interna"
          name="zone"
          rules={[{ required: true, message: "Ingresa la zona" }]}
          tooltip="Etiqueta corta para filtros y badges (Polanco, Pedregal, Tulum)"
        >
          <Input placeholder="Polanco, Pedregal, Bosques…" />
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

        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-slate-700">Mapa</p>
          <p className="text-xs text-slate-500">
            Usa el buscador o haz clic en el mapa para fijar ubicación.
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

        <Divider titlePlacement="start" plain>
          Precio y multimedia
        </Divider>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            label="Precio (MXN)"
            name="price"
            rules={[{ required: true, message: "Ingresa el precio" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              step={100000}
              placeholder="22500000"
            />
          </Form.Item>
          <Form.Item label="Etiqueta de precio" name="priceLabel">
            <Input placeholder="MN $22,500,000" />
          </Form.Item>
          <Form.Item label="Estatus" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "draft", label: "Borrador" },
                { value: "published", label: "Publicado" },
                { value: "archived", label: "Archivado" },
              ]}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label="Video URL"
            name="videoUrl"
            tooltip="YouTube embed, Vimeo o link directo"
          >
            <Input placeholder="https://youtube.com/embed/..." />
          </Form.Item>
          <Form.Item label="Tour virtual URL" name="virtualTourUrl">
            <Input placeholder="https://kuula.co/share/..." />
          </Form.Item>
        </div>

        {/* ── Labels heredados (auto-generados, editables como override) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label="Label de recámaras (override)"
            name="bedsLabel"
            tooltip="Si se deja vacío, se genera automáticamente desde el campo Recámaras"
          >
            <Input placeholder="3 rec." />
          </Form.Item>
          <Form.Item
            label="Label de tamaño (override)"
            name="sizeLabel"
            tooltip="Si se deja vacío, se genera automáticamente desde m² construidos / terreno"
          >
            <Input placeholder="320 m² const. · 280 m² terreno" />
          </Form.Item>
        </div>

        {isAdmin && (
          <>
            <Divider titlePlacement="start" plain>
              Solo administradores
            </Divider>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                label="Agente publicador"
                name="agentId"
                tooltip="Usuario con rol publisher al que pertenece el listing"
              >
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  placeholder="Asignar a un agente"
                  options={agents.map((a) => ({
                    value: a.id,
                    label: `${a.fullName} · ${a.email}`,
                  }))}
                />
              </Form.Item>
              {isSuperadmin && (
                <Form.Item
                  label="Premier"
                  name="isPremier"
                  valuePropName="checked"
                  tooltip="Listing exclusivo de Gabana"
                >
                  <Switch />
                </Form.Item>
              )}
              <Form.Item
                label="Destacado (Featured)"
                name="isFeatured"
                valuePropName="checked"
                tooltip="Aparece arriba en resultados de su zona/operación"
              >
                <Switch />
              </Form.Item>
            </div>
          </>
        )}
      </Form>

      {mode === "edit" && listing && (
        <>
          <Divider />
          <ListingPhotosInline listing={listing} />
        </>
      )}
    </Modal>
  );
};
