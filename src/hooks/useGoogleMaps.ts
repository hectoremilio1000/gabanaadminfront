// src/hooks/useGoogleMaps.ts
import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
    __googleMapsInit?: () => void;
  }
}

const SCRIPT_ID = "google-maps-sdk";
const CALLBACK_NAME = "__googleMapsInit";

type UseGoogleMapsResult = {
  ready: boolean;
  error: string | null;
};

// `enabled` lets us skip loading the SDK (useful in mocked e2e environments).
export function useGoogleMaps(
  apiKey?: string,
  libraries: string[] = ["places"],
  enabled = true
): UseGoogleMapsResult {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      setError(null);
      return;
    }

    if (!apiKey) {
      setError("Falta VITE_GOOGLE_MAPS_API_KEY");
      return;
    }

    // Ya cargado
    if (window.google?.maps) {
      setReady(true);
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      existing.addEventListener("error", () => setError("No se pudo cargar Google Maps"));
      return;
    }

    window[CALLBACK_NAME] = () => setReady(true);

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(
      ","
    )}&callback=${CALLBACK_NAME}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    script.onerror = () => setError("No se pudo cargar Google Maps");
    document.head.appendChild(script);
  }, [apiKey, libraries.join(","), enabled]);

  return { ready, error };
}
