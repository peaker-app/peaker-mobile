"use client";

import "leaflet/dist/leaflet.css";
import { divIcon, type LeafletMouseEvent } from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvent } from "react-leaflet";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import {
  detailZoom,
  maxTileZoom,
  tileAttribution,
  tileUrl,
  worldView,
} from "@/lib/map";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
}

export interface PeakMapViewProps {
  points: readonly MapPoint[];
  origin?: { latitude: number; longitude: number };
  radiusMeters?: number;
  zoom?: number;
  highlightedId?: string;
  onPick?: (latitude: number, longitude: number) => void;
  className?: string;
}

const pinIcon = (highlighted: boolean) =>
  divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);background:${
      highlighted ? "#b91c1c" : "#0f766e"
    }"></span>`,
  });

const originIcon = divIcon({
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4);background:#1d4ed8"></span>',
});

const RecenterOnChange = ({
  latitude,
  longitude,
  zoom,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], zoom);
  }, [map, latitude, longitude, zoom]);

  return null;
};

const ClickToPick = ({
  onPick,
}: {
  onPick: (latitude: number, longitude: number) => void;
}) => {
  useMapEvent("click", (event: LeafletMouseEvent) => {
    onPick(event.latlng.lat, event.latlng.lng);
  });

  return null;
};

export const PeakMapView = ({
  points,
  origin,
  radiusMeters,
  zoom,
  highlightedId,
  onPick,
  className,
}: PeakMapViewProps) => {
  const center = origin ?? points[0];
  const resolvedZoom = zoom ?? (center ? detailZoom : worldView.zoom);
  const latitude = center?.latitude ?? worldView.latitude;
  const longitude = center?.longitude ?? worldView.longitude;

  return (
    <div aria-hidden className={cn("isolate overflow-hidden rounded-md", className)}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={resolvedZoom}
        scrollWheelZoom={false}
        className="size-full"
      >
        <TileLayer
          url={tileUrl()}
          attribution={tileAttribution()}
          maxZoom={maxTileZoom}
        />
        <RecenterOnChange
          latitude={latitude}
          longitude={longitude}
          zoom={resolvedZoom}
        />
        {onPick ? <ClickToPick onPick={onPick} /> : null}
        {origin ? (
          <Marker
            position={[origin.latitude, origin.longitude]}
            icon={originIcon}
          />
        ) : null}
        {origin && radiusMeters ? (
          <Circle
            center={[origin.latitude, origin.longitude]}
            radius={radiusMeters}
            pathOptions={{ color: "#1d4ed8", weight: 1, fillOpacity: 0.08 }}
          />
        ) : null}
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={pinIcon(point.id === highlightedId)}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default PeakMapView;
