import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewList } from "@/components/review/review-list";
import { QRModal } from "@/components/qr/qr-modal";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { MapView } from "@/components/map/map-view";
import { formatPriceRange, slugify } from "@/lib/utils";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Heart,
  Share2,
  Navigation,
  CheckCircle2,
  Utensils,
  Camera,
  MessageSquare,
} from "lucide-react";

interface RestaurantPageProps {
  params: Promise<{
    city: string;
    area: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { location: true },
  });

  if (!restaurant) return { title: "Restaurant Not Found | FoodAtlas" };

  return {
    title: `${restaurant.name} (${restaurant.location?.areaName}, ${restaurant.location?.cityName}) - Menu, Photos & Reviews | FoodAtlas`,
    description: `Explore full digital menu, prices, authentic reviews, opening hours, and location for ${restaurant.name} in ${restaurant.location?.areaName}, ${restaurant.location?.cityName}.`,
    openGraph: {
      title: `${restaurant.name} - FoodAtlas`,
      description: restaurant.description || `Discover menu and reviews for ${restaurant.name}`,
      images: restaurant.bannerImageUrl ? [{ url: restaurant.bannerImageUrl }] : [],
    },
  };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      location: true,
      cuisines: { include: { cuisine: true } },
      menuCategories: {
        where: { active: true },
        orderBy: { displayOrder: "asc" },
        include: {
          items: {
            where: { available: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      },
      photos: {
        where: { moderationStatus: "APPROVED" },
        take: 8,
      },
      openingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      reviews: {
        where: { moderationStatus: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          photos: true,
        },
      },
    },
  });

  if (!restaurant || restaurant.deletedAt) {
    notFound();
  }

  // Find similar restaurants in same city/cuisine
  const primaryCuisineId = restaurant.cuisines[0]?.cuisineId;
  const similarRestaurants = await prisma.restaurant.findMany({
    where: {
      id: { not: restaurant.id },
      status: "ACTIVE",
      deletedAt: null,
      OR: [
        { location: { cityName: restaurant.location?.cityName } },
        ...(primaryCuisineId
          ? [{ cuisines: { some: { cuisineId: primaryCuisineId } } }]
          : []),
      ],
    },
    take: 3,
    include: {
      location: true,
      cuisines: { include: { cuisine: true } },
      menuItems: { take: 2, select: { name: true, veg: true } },
    },
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = new Date().getDay();

  // Structured Data (JSON-LD) for Google SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    image: restaurant.bannerImageUrl,
    description: restaurant.description,
    telephone: restaurant.phone,
    priceRange: formatPriceRange(restaurant.priceRange),
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.location?.address,
      addressLocality: restaurant.location?.areaName,
      addressRegion: restaurant.location?.cityName,
      postalCode: restaurant.location?.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.location?.latitude,
      longitude: restaurant.location?.longitude,
    },
    aggregateRating: restaurant.averageRating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: restaurant.averageRating,
      reviewCount: restaurant.reviewCount,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Schema.org injection for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Photo Gallery */}
      <section className="bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-72 sm:h-96 rounded-3xl overflow-hidden">
            {/* Main Cover Photo */}
            <div className="relative md:col-span-2 h-full bg-stone-800">
              <Image
                src={restaurant.bannerImageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80"}
                alt={restaurant.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
            </div>

            {/* Gallery grid */}
            <div className="hidden md:grid grid-rows-2 gap-3 h-full">
              <div className="relative h-full bg-stone-800">
                <Image
                  src={restaurant.photos[1]?.url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"}
                  alt={`${restaurant.name} Ambience`}
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
              <div className="relative h-full bg-stone-800">
                <Image
                  src={restaurant.photos[2]?.url || "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"}
                  alt={`${restaurant.name} Dining`}
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Columns: Main Details, Menu, Photos, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Restaurant Profile Header Card */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                      {restaurant.name}
                    </h1>
                    {restaurant.verificationStatus === "VERIFIED" && (
                      <span className="text-emerald-600 inline-flex items-center" title="Verified FoodAtlas Listing">
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    {restaurant.cuisines.map((c) => c.cuisine.name).join(" • ")}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-stone-600 mt-2">
                    <span className="font-bold text-stone-900">{formatPriceRange(restaurant.priceRange)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      {restaurant.location?.areaName}, {restaurant.location?.cityName}
                    </span>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="flex items-center gap-3 self-start bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-md">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="text-xl font-black">
                      {restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : "New"}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 border-l border-stone-700 pl-3 leading-tight">
                    <span className="block font-bold text-white">{restaurant.reviewCount}</span>
                    <span>Reviews</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-stone-100">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${restaurant.name} ${restaurant.location?.address} ${restaurant.location?.cityName}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>Call Restaurant</span>
                  </a>
                )}

                <QRModal restaurantSlug={restaurant.slug} restaurantName={restaurant.name} />
              </div>

              {/* About description */}
              {restaurant.description && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">About</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">{restaurant.description}</p>
                </div>
              )}
            </div>

            {/* Complete Menu Section */}
            <div id="menu" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-0.5">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>FoodAtlas Menu</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    Complete Dining Menu
                  </h2>
                </div>
                <Link
                  href={`/menu/${restaurant.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-orange-600 hover:underline"
                >
                  Open Fullscreen QR Menu ↗
                </Link>
              </div>

              {/* Category-wise items */}
              {restaurant.menuCategories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500 text-sm">
                  Menu items are currently being updated by the restaurant.
                </div>
              ) : (
                <div className="space-y-8">
                  {restaurant.menuCategories.map((category) => (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
                        <h3 className="font-black text-lg text-stone-900">{category.name}</h3>
                        <span className="text-xs font-medium text-stone-400">
                          {category.items.length} items
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.items.map((item) => (
                          <MenuItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-0.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Verified Feedback</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    Customer Reviews
                  </h2>
                </div>
              </div>

              {/* Review Input */}
              <ReviewForm restaurantId={restaurant.id} />

              {/* Review List */}
              <ReviewList reviews={restaurant.reviews} />
            </div>
          </div>

          {/* Right Column: Location Map, Opening Hours, Contact Info */}
          <div className="space-y-6">
            {/* Opening Hours Card */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Operating Hours</span>
              </div>

              <div className="space-y-2 text-xs">
                {restaurant.openingHours.map((h) => {
                  const isToday = h.dayOfWeek === currentDay;
                  return (
                    <div
                      key={h.id}
                      className={`flex items-center justify-between py-1 px-2 rounded-lg ${
                        isToday ? "bg-orange-50 font-bold text-orange-900" : "text-stone-600"
                      }`}
                    >
                      <span>{dayNames[h.dayOfWeek]} {isToday && "(Today)"}</span>
                      <span>
                        {h.isClosed ? "Closed" : `${h.openTime} – ${h.closeTime}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Address & Contact Card */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">
                Location & Contact
              </h3>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">{restaurant.location?.address}</p>
                    {restaurant.location?.landmark && (
                      <p className="text-stone-500">Landmark: {restaurant.location.landmark}</p>
                    )}
                    <p className="text-stone-500">
                      {restaurant.location?.areaName}, {restaurant.location?.cityName} - {restaurant.location?.postalCode}
                    </p>
                  </div>
                </div>

                {restaurant.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}

                {restaurant.website && (
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-stone-400 shrink-0" />
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline truncate"
                    >
                      {restaurant.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Mini Map Preview */}
              {restaurant.location && (
                <div className="pt-2">
                  <MapView
                    markers={[
                      {
                        id: restaurant.id,
                        name: restaurant.name,
                        slug: restaurant.slug,
                        latitude: restaurant.location.latitude,
                        longitude: restaurant.location.longitude,
                        averageRating: restaurant.averageRating,
                        priceRange: restaurant.priceRange,
                        bannerImageUrl: restaurant.bannerImageUrl,
                        areaName: restaurant.location.areaName,
                        cityName: restaurant.location.cityName,
                      },
                    ]}
                    className="h-44 w-full"
                  />
                </div>
              )}
            </div>

            {/* Similar Places */}
            {similarRestaurants.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-stone-900">
                  Similar Places You Might Like
                </h3>
                <div className="space-y-4">
                  {similarRestaurants.map((sim) => (
                    <RestaurantCard key={sim.id} restaurant={sim} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
