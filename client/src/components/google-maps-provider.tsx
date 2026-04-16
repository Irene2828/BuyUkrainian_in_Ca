import type { ReactNode } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "").trim();

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  return (
    <APIProvider
      apiKey={googleMapsApiKey || "MISSING_GOOGLE_MAPS_API_KEY"}
      authReferrerPolicy="origin"
      onError={(error) => {
        console.error("[Google Maps] Failed to load map assets", error);
      }}
    >
      {children}
    </APIProvider>
  );
}
