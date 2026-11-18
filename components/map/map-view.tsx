"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Navigation, ExternalLink } from "lucide-react";
import { formatPriceRange, slugify } from "@/lib/utils";

interface MapMarker {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  priceRange: number;
  bannerImageUrl?: string | null;
  areaName?: string;
  cityName?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  className?: string;
}

export function MapView({
  markers,
  centerLat = 17.4168,
  centerLng = 78.4382,
  className = "h-[450px] w-full",
}: MapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(markers[0] || null);

  // Approximate relative positioning on canvas for visual display
  const minLat = Math.min(...markers.map((m) => m.latitude), centerLat) - 0.05;
  const maxLat = Math.max(...markers.map((m) => m.latitude), centerLat) + 0.05;
  const minLng = Math.min(...markers.map((m) => m.longitude), centerLng) - 0.05;
  const maxLng = Math.max(...markers.map((m) => m.longitude), centerLng) + 0.05;

  const getPositionStyle = (lat: number, lng: number) => {
    const topPercent = 100 - ((lat - minLat) / (maxLat - minLat || 1)) * 100;
    const leftPercent = ((lng - minLng) / (maxLng - minLng || 1)) * 100;
    return {
      top: `${Math.max(8, Math.min(92, topPercent))}%`,
      left: `${Math.max(8, Math.min(92, leftPercent))}%`,
    };
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 ${className}`}>
      {/* Map Tile Grid Background */}
      <div
        className="absolute inset-0 opacity-40 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] [background-size:16px_16px]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Map Header Status */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-xs font-semibold text-stone-800 border border-stone-200">
        <Navigation className="w-3.5 h-3.5 text-orange-600" />
        <span>FoodAtlas Geospatial Discovery</span>
        <span className="text-stone-400 font-normal">({markers.length} places)</span>
      </div>

      {/* Markers */}
      <div className="absolute inset-0">
        {markers.map((marker) => {
          const isSelected = selectedMarker?.id === marker.id;
          const pos = getPositionStyle(marker.latitude, marker.longitude);

          return (
            <button
              key={marker.id}
              onClick={() => setSelectedMarker(marker)}
              style={pos}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group flex items-center gap-1.5 px-2 py-1 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                isSelected
                  ? "bg-orange-600 text-white ring-4 ring-orange-500/30 scale-110"
                  : "bg-white text-stone-800 hover:bg-orange-50 border border-stone-200"
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-orange-600"}`} />
              <span className="text-[11px] font-bold max-w-[80px] truncate">{marker.name}</span>
              <span className={`text-[10px] font-semibold px-1 rounded ${isSelected ? "bg-orange-700" : "bg-stone-100"}`}>
                ★ {marker.averageRating.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Restaurant Popup Preview Card */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-white rounded-xl shadow-2xl border border-stone-200 p-3 flex gap-3 items-center backdrop-blur-md">
          {selectedMarker.bannerImageUrl && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100">
              <Image
                src={selectedMarker.bannerImageUrl}
                alt={selectedMarker.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-stone-900 truncate">
              {selectedMarker.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-stone-500 my-0.5">
              <span className="flex items-center gap-0.5 font-bold text-stone-800">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {selectedMarker.averageRating.toFixed(1)}
              </span>
              <span>•</span>
              <span>{formatPriceRange(selectedMarker.priceRange)}</span>
              {selectedMarker.areaName && (
                <>
                  <span>•</span>
                  <span className="truncate">{selectedMarker.areaName}</span>
                </>
              )}
            </div>
            <Link
              href={`/restaurants/${slugify(selectedMarker.cityName || "hyderabad")}/${slugify(
                selectedMarker.areaName || "area"
              )}/${selectedMarker.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition"
            >
              <span>View Restaurant</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
