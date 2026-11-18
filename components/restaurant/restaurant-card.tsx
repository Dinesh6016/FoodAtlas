"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Heart, Clock, Utensils } from "lucide-react";
import { formatPriceRange, slugify } from "@/lib/utils";

interface RestaurantCardProps {
  restaurant: any;
  isInitiallyFavorited?: boolean;
}

export function RestaurantCard({ restaurant, isInitiallyFavorited = false }: RestaurantCardProps) {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [loadingFav, setLoadingFav] = useState(false);

  const citySlug = slugify(restaurant.location?.cityName || "city");
  const areaSlug = slugify(restaurant.location?.areaName || "area");
  const restaurantUrl = `/restaurants/${citySlug}/${areaSlug}/${restaurant.slug}`;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingFav(true);

    try {
      if (isFavorited) {
        const res = await fetch(`/api/favorites/${restaurant.id}`, { method: "DELETE" });
        if (res.ok) setIsFavorited(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId: restaurant.id }),
        });
        if (res.ok) setIsFavorited(true);
      }
    } catch {
      // ignore
    } finally {
      setLoadingFav(false);
    }
  };

  const cuisines = restaurant.cuisines?.map((c: any) => c.cuisine?.name || c.name).slice(0, 3) || [];
  const popularDishes = restaurant.menuItems?.slice(0, 2) || [];

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 flex flex-col">
      {/* Image Banner */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <Link href={restaurantUrl} className="block w-full h-full">
          <Image
            src={
              restaurant.bannerImageUrl ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
            }
            alt={restaurant.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Favorite Heart Button */}
        <button
          onClick={toggleFavorite}
          disabled={loadingFav}
          aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
            isFavorited
              ? "bg-red-500 text-white hover:bg-red-600 scale-110"
              : "bg-white/80 hover:bg-white text-stone-700 hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-white" : ""}`} />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/90 backdrop-blur-md text-white text-xs font-bold shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : "New"}</span>
          {restaurant.reviewCount > 0 && (
            <span className="text-stone-400 text-[10px] font-normal">
              ({restaurant.reviewCount})
            </span>
          )}
        </div>

        {/* Open Now / Closed Status */}
        {restaurant.isOpenNow !== undefined && (
          <div
            className={`absolute top-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
              restaurant.isOpenNow
                ? "bg-emerald-600/90 text-white"
                : "bg-stone-800/80 text-stone-300"
            }`}
          >
            {restaurant.isOpenNow ? "Open Now" : "Closed"}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Name & Price */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link href={restaurantUrl}>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                {restaurant.name}
              </h3>
            </Link>
            <span className="text-xs font-bold text-stone-500 tracking-wider shrink-0">
              {formatPriceRange(restaurant.priceRange)}
            </span>
          </div>

          {/* Cuisines */}
          <p className="text-xs text-stone-500 line-clamp-1 mb-3">
            {cuisines.length > 0 ? cuisines.join(" • ") : "Multi-Cuisine"}
          </p>

          {/* Location Area & City */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3">
            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="line-clamp-1">
              {restaurant.location?.areaName || "Area"}, {restaurant.location?.cityName || "City"}
            </span>
            {restaurant.distanceKm && (
              <span className="text-stone-400 shrink-0 font-medium">• {restaurant.distanceKm} km</span>
            )}
          </div>
        </div>

        {/* Bottom Section: Popular Dish / Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
          {popularDishes.length > 0 ? (
            <div className="flex items-center gap-1.5 text-stone-600 truncate mr-2">
              <span className={popularDishes[0].veg ? "veg-badge shrink-0" : "non-veg-badge shrink-0"} />
              <span className="text-stone-500 text-[11px] truncate">
                Must try: <span className="font-medium text-stone-800">{popularDishes[0].name}</span>
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-stone-400">Verified FoodAtlas Listing</span>
          )}

          <Link
            href={restaurantUrl}
            className="text-orange-600 font-semibold hover:text-orange-700 shrink-0 text-xs transition"
          >
            Explore →
          </Link>
        </div>
      </div>
    </div>
  );
}
