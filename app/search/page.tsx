import React, { Suspense } from "react";
import searchService from "@/lib/search/search-service";
import prisma from "@/lib/db/prisma";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { MapView } from "@/components/map/map-view";
import { SortSelect } from "@/components/search/sort-select";
import Link from "next/link";
import {
  SlidersHorizontal,
  MapPin,
  Star,
  Compass,
  ArrowUpDown,
  Check,
  Map as MapIcon,
  List,
} from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    area?: string;
    cuisine?: string;
    vegOnly?: string;
    minRating?: string;
    priceRange?: string;
    sortBy?: string;
    page?: string;
    view?: string; // "list" | "map"
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const city = params.city || undefined;
  const area = params.area || undefined;
  const cuisine = params.cuisine || undefined;
  const vegOnly = params.vegOnly === "true";
  const minRating = params.minRating ? Number(params.minRating) : 0;
  const priceRanges = params.priceRange
    ? params.priceRange.split(",").map(Number).filter((n) => !isNaN(n))
    : [];
  const sortBy = (params.sortBy as any) || "relevance";
  const page = params.page ? Number(params.page) : 1;
  const isMapView = params.view === "map";

  // Execute Search
  const { restaurants, total, totalPages } = await searchService.search({
    query,
    city,
    area,
    cuisine,
    vegOnly,
    minRating,
    priceRanges,
    sortBy,
    page,
    limit: 15,
  });

  // Fetch all cuisines for filter sidebar
  const allCuisines = await prisma.cuisine.findMany({
    take: 15,
    orderBy: { name: "asc" },
  });

  // Prepare map markers
  const mapMarkers = restaurants
    .filter((r) => r.location?.latitude && r.location?.longitude)
    .map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      averageRating: r.averageRating,
      priceRange: r.priceRange,
      bannerImageUrl: r.bannerImageUrl,
      areaName: r.location.areaName,
      cityName: r.location.cityName,
    }));

  const buildFilterUrl = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams();
    if (query) current.set("q", query);
    if (city) current.set("city", city);
    if (area) current.set("area", area);
    if (cuisine) current.set("cuisine", cuisine);
    if (vegOnly) current.set("vegOnly", "true");
    if (minRating) current.set("minRating", minRating.toString());
    if (priceRanges.length > 0) current.set("priceRange", priceRanges.join(","));
    if (sortBy && sortBy !== "relevance") current.set("sortBy", sortBy);
    if (isMapView) current.set("view", "map");

    for (const [key, value] of Object.entries(newParams)) {
      if (value === null) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    }
    return `/search?${current.toString()}`;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Top Search Filter Header */}
      <div className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <Link href="/" className="hover:text-stone-800">Home</Link>
                <span>/</span>
                <span className="text-stone-800 font-semibold">Search</span>
                {city && (
                  <>
                    <span>/</span>
                    <span className="text-orange-600 font-semibold">{city}</span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {query ? `Results for "${query}"` : city ? `Food & Restaurants in ${city}` : "Discover All Restaurants"}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Showing {restaurants.length} of {total} verified places
              </p>
            </div>

            {/* View switcher & Quick Sort */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Map / List toggle */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
                <Link
                  href={buildFilterUrl({ view: null })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    !isMapView ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </Link>
                <Link
                  href={buildFilterUrl({ view: "map" })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    isMapView ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </Link>
              </div>

              {/* Sort selector */}
              <Suspense fallback={<div className="w-28 h-8 bg-stone-100 rounded-xl animate-pulse" />}>
                <SortSelect currentSort={sortBy} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
                  <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                  <span>Filters</span>
                </div>
                {(cuisine || vegOnly || minRating > 0 || priceRanges.length > 0) && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city || "")}`}
                    className="text-[11px] font-semibold text-orange-600 hover:underline"
                  >
                    Reset All
                  </Link>
                )}
              </div>

              {/* Diet: Pure Veg toggle */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Dietary Preference
                </h4>
                <Link
                  href={buildFilterUrl({ vegOnly: vegOnly ? null : "true" })}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition ${
                    vegOnly
                      ? "border-emerald-500 bg-emerald-50/60 text-emerald-800"
                      : "border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="veg-badge" />
                    <span>Pure Veg Options Only</span>
                  </div>
                  {vegOnly && <Check className="w-4 h-4 text-emerald-600" />}
                </Link>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Minimum Rating
                </h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 3.5, 4.0, 4.5].map((r) => (
                    <Link
                      key={r}
                      href={buildFilterUrl({ minRating: r === 0 ? null : r.toString() })}
                      className={`text-center py-1.5 rounded-lg text-xs font-semibold border transition ${
                        minRating === r
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {r === 0 ? "Any" : `${r}+ ★`}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Price for Two
                </h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((pr) => {
                    const isSelected = priceRanges.includes(pr);
                    const newRanges = isSelected
                      ? priceRanges.filter((p) => p !== pr)
                      : [...priceRanges, pr];

                    return (
                      <Link
                        key={pr}
                        href={buildFilterUrl({
                          priceRange: newRanges.length > 0 ? newRanges.join(",") : null,
                        })}
                        className={`text-center py-1.5 rounded-lg text-xs font-bold border transition ${
                          isSelected
                            ? "bg-stone-900 text-white border-stone-900"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        {"₹".repeat(pr)}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Cuisines */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Cuisines
                </h4>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {allCuisines.map((c) => {
                    const isSelected = cuisine === c.slug;
                    return (
                      <Link
                        key={c.id}
                        href={buildFilterUrl({ cuisine: isSelected ? null : c.slug })}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? "bg-orange-50 text-orange-600 font-bold"
                            : "text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Search Results */}
          <div className="lg:col-span-3 space-y-6">
            {isMapView ? (
              <div className="space-y-6">
                <MapView markers={mapMarkers} className="h-[520px] w-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">No restaurants found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your keywords, selecting a different city, or removing filters to broaden your search.
                </p>
                <Link
                  href="/search"
                  className="inline-block px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={buildFilterUrl({ page: p.toString() })}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                          page === p
                            ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
                            : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
