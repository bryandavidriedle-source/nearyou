"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  type MapRef,
} from "react-map-gl/mapbox";
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
  const [mapStyle, setMapStyle] = useState<"light" | "streets" | "outdoors">("streets");

  const mapboxToken = publicEnv.NEXT_PUBLIC_MAPBOX_TOKEN;
  const styleUri =
    mapStyle === "light"
      ? "mapbox://styles/mapbox/light-v11"
      : mapStyle === "outdoors"
        ? "mapbox://styles/mapbox/outdoors-v12"
        : "mapbox://styles/mapbox/streets-v12";

  const markerStyle = (type: MarkerItem["type"], isSelected: boolean) => {
    const base =
      "group relative inline-flex items-center justify-center rounded-full border text-white shadow-[0_10px_28px_rgba(15,23,42,0.25)] transition duration-200";

    const tone =
      type === "provider"
        ? "bg-emerald-600 border-emerald-100"
        : type === "parking"
          ? "bg-blue-700 border-blue-100"
          : "bg-slate-700 border-slate-100";

    return `${base} ${tone} ${isSelected ? "h-11 w-11 scale-110 ring-4 ring-blue-200/70" : "h-9 w-9 scale-100"}`;
  };

  const markerLabel = (type: MarkerItem["type"]) => {
    if (type === "provider") return "Prestataire";
    if (type === "parking") return "Parking";
    return "Partenaire";
  };

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
    <div className="relative h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm">
      <div className="absolute left-3 top-3 z-10 rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow backdrop-blur">
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            className={`rounded-md px-2 py-1 ${mapStyle === "light" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
            onClick={() => setMapStyle("light")}
          >
            Clair
          </button>
          <button
            type="button"
            className={`rounded-md px-2 py-1 ${mapStyle === "streets" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
            onClick={() => setMapStyle("streets")}
          >
            Ville
          </button>
          <button
            type="button"
            className={`rounded-md px-2 py-1 ${mapStyle === "outdoors" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}
            onClick={() => setMapStyle("outdoors")}
          >
            Relief
          </button>
        </div>
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        mapStyle={styleUri}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" visualizePitch />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          showAccuracyCircle={false}
          fitBoundsOptions={{ maxZoom: 13 }}
        />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" unit="metric" />

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
                className={markerStyle(marker.type, isSelected)}
              >
                <span
                  className={`pointer-events-none absolute inset-0 rounded-full ${isSelected ? "animate-ping bg-blue-200/45" : ""}`}
                />
                <Icon className={`${isSelected ? "h-5 w-5" : "h-4 w-4"} relative`} />
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
            className="nearyou-map-popup"
          >
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-900">{popup.label}</p>
              <p className="text-slate-600">{markerLabel(popup.type)}</p>
            </div>
          </Popup>
        ) : null}
      </Map>
    </div>
  );
}


