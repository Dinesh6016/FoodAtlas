import React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db/prisma";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { Search, MapPin, Sparkles, TrendingUp, Flame, Award, ChevronRight } from "lucide-react";

export const revalidate = 60; // ISR cache for 60 seconds

export default async function HomePage() {
  // Query featured cuisines
  const cuisines = await prisma.cuisine.findMany({
    take: 8,
    orderBy: { restaurants: { _count: "desc" } },
  });

  // Query popular restaurants (trending / top rated)
  const popularRestaurants = await prisma.restaurant.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    take: 6,
    orderBy: { averageRating: "desc" },
    include: {
      location: true,
      cuisines: { include: { cuisine: true } },
      menuItems: { take: 2, select: { name: true, veg: true } },
      openingHours: true,
    },
  });

  // Query budget-friendly eateries (priceRange = 1)
  const budgetRestaurants = await prisma.restaurant.findMany({
    where: { status: "ACTIVE", deletedAt: null, priceRange: 1 },
    take: 6,
    orderBy: { reviewCount: "desc" },
    include: {
      location: true,
      cuisines: { include: { cuisine: true } },
      menuItems: { take: 2, select: { name: true, veg: true } },
      openingHours: true,
    },
  });

  // Query popular dishes across menus
  const popularDishes = await prisma.menuItem.findMany({
    where: {
      available: true,
      image: { not: null },
      restaurant: { status: "ACTIVE" },
    },
    take: 8,
    orderBy: { displayOrder: "asc" },
    include: {
      restaurant: {
        select: {
          name: true,
          slug: true,
          averageRating: true,
          location: { select: { cityName: true, areaName: true } },
        },
      },
    },
  });

  const cravingSuggestions = [
    { label: "Biryani", query: "biryani", icon: "🍛" },
    { label: "Pizza", query: "pizza", icon: "🍕" },
    { label: "Burgers", query: "burger", icon: "🍔" },
    { label: "Paneer Butter Masala", query: "paneer", icon: "🧀" },
    { label: "Crispy Dosa", query: "dosa", icon: "🥞" },
    { label: "Desserts & Shakes", query: "dessert", icon: "🍰" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white py-16 sm:py-24 lg:py-28">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,88,12,0.25),rgba(255,255,255,0))]" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover authentic food places across India</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Discover great food <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              near you.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 leading-relaxed">
            Browse complete digital menus, food photos, chef specialties, and verified ratings
            for Hyderabad, Bengaluru, Mumbai and top culinary hubs.
          </p>

          {/* Large Hero Search Box */}
          <div className="max-w-3xl mx-auto pt-4">
            <form
              action="/search"
              method="GET"
              className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-stone-800"
            >
              {/* City selector dropdown */}
              <div className="flex items-center gap-2 px-4 py-2 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-stone-200">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                <select
                  name="city"
                  defaultValue="Hyderabad"
                  className="bg-transparent text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>

              {/* Text search input */}
              <div className="flex-1 flex items-center gap-2 px-3 w-full">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="What are you craving? e.g., Biryani, Paradise, Pizza, Mandi..."
                  className="w-full text-xs sm:text-sm bg-transparent placeholder:text-stone-400 focus:outline-none py-1"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0"
              >
                <span>Search</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick craving pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <span className="text-xs text-stone-400 font-medium mr-1 hidden sm:inline">Popular:</span>
              {cravingSuggestions.map((item) => (
                <Link
                  key={item.label}
                  href={`/search?q=${encodeURIComponent(item.query)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60 text-xs transition"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pt-12">
        {/* Section: Trending Cuisines */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Culinary Categories</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Explore Popular Cuisines
              </h2>
            </div>
            <Link
              href="/cuisines"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
            >
              <span>All Cuisines</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {cuisines.map((c) => (
              <Link
                key={c.id}
                href={`/search?cuisine=${c.slug}`}
                className="group relative flex flex-col items-center p-3 rounded-2xl bg-white border border-stone-200 hover:border-orange-500/40 hover:shadow-md transition text-center"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 bg-stone-100 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={c.imageUrl || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80"}
                    alt={c.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-xs text-stone-800 group-hover:text-orange-600 transition truncate w-full">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Trending & Popular Restaurants */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Curated Recommendations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Trending Restaurants
              </h2>
            </div>
            <Link
              href="/search?sortBy=rating"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>

        {/* Section: Signature Dishes Highlight */}
        {popularDishes.length > 0 && (
          <section className="bg-orange-50/60 rounded-3xl p-6 sm:p-10 border border-orange-100">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Dish Discovery</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  Iconic Signature Dishes
                </h2>
              </div>
              <Link
                href="/search?q=biryani"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
              >
                <span>Search Dishes</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl p-3 border border-orange-200/60 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 mb-3">
                    {dish.image && (
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={dish.veg ? "veg-badge" : "non-veg-badge"} />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{dish.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-1 mb-2">
                      at{" "}
                      <Link
                        href={`/restaurants/hyderabad/area/${dish.restaurant.slug}`}
                        className="font-medium text-stone-700 hover:text-orange-600"
                      >
                        {dish.restaurant.name}
                      </Link>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <span className="font-bold text-stone-900">₹{dish.price}</span>
                    <span className="text-[11px] text-stone-400">
                      ★ {dish.restaurant.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Budget-Friendly Favorites */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                <span>₹</span>
                <span>Pocket Friendly</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Great Food Under ₹300
              </h2>
            </div>
            <Link
              href="/search?priceRange=1"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>

        {/* Section: Restaurant Owner Callout Banner */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white p-8 sm:p-12 border border-stone-800">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              For Restaurant Owners & Food Entrepreneurs
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Grow Your Restaurant With FoodAtlas
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Showcase your complete digital menu, update real-time item prices, publish high-res photos,
              and reach thousands of local food lovers looking for their next favorite meal.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/owner/claim"
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
              >
                Claim Your Listing
              </Link>
              <Link
                href="/owner/dashboard"
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition"
              >
                Open Owner Portal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
