"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/mapbox";
import { MapPin, CarFront, Store } from "lucide-react";

import { Card } from "@/components/ui/card";
import { publicEnv } from "@/lib/env";

type MarkerItem = {
  id: string;
  lat: number;
  lng: number;
  type: "provider" | "parking" | "partner";
  label: string;
};

type ProviderMapProps = {
  markers: MarkerItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ProviderMap({ markers, selectedId, onSelect }: ProviderMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [popup, setPopup] = useState<MarkerItem | null>(null);

  const mapboxToken = publicEnv.NEXT_PUBLIC_MAPBOX_TOKEN;

  const initialViewState = useMemo(() => {
    if (markers.length === 0) {
      return { latitude: 46.5197, longitude: 6.6323, zoom: 11.8 };
    }

    const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
    return { latitude: avgLat, longitude: avgLng, zoom: 12 };
  }, [markers]);

  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return;

    const bounds = markers.reduce(
      (acc, marker) => {
        return {
          minLat: Math.min(acc.minLat, marker.lat),
          maxLat: Math.max(acc.maxLat, marker.lat),
          minLng: Math.min(acc.minLng, marker.lng),
          maxLng: Math.max(acc.maxLng, marker.lng),
        };
      },
      { minLat: markers[0].lat, maxLat: markers[0].lat, minLng: markers[0].lng, maxLng: markers[0].lng },
    );

    mapRef.current.fitBounds(
      [
        [bounds.minLng, bounds.minLat],
        [bounds.maxLng, bounds.maxLat],
      ],
      { padding: 60, duration: 600, maxZoom: 14 },
    );
  }, [markers]);

  if (!mapboxToken) {
    return (
      <Card className="flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
        Clé Mapbox absente. Ajoutez `NEXT_PUBLIC_MAPBOX_TOKEN` pour activer la carte interactive.
      </Card>
    );
  }

  return (
    <div className="h-[600px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {markers.map((marker) => {
          const isSelected = marker.id === selectedId;
          const icon = marker.type === "provider" ? MapPin : marker.type === "parking" ? CarFront : Store;
          const Icon = icon;

          return (
            <Marker key={`${marker.type}-${marker.id}`} latitude={marker.lat} longitude={marker.lng} anchor="bottom">
              <button
                type="button"
                aria-label={marker.label}
                onClick={() => {
                  onSelect(marker.id);
                  setPopup(marker);
                }}
                className={`rounded-full border-2 p-1.5 text-white shadow ${
                  marker.type === "provider" ? "bg-green-600 border-green-100" : marker.type === "parking" ? "bg-blue-700 border-blue-100" : "bg-slate-700 border-slate-100"
                } ${isSelected ? "scale-110" : "scale-100"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            </Marker>
          );
        })}

        {popup ? (
          <Popup
            longitude={popup.lng}
            latitude={popup.lat}
            closeButton
            closeOnClick={false}
            onClose={() => setPopup(null)}
            anchor="top"
          >
            <div className="text-xs">
              <p className="font-semibold">{popup.label}</p>
              <p className="text-slate-600">Type: {popup.type}</p>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}


