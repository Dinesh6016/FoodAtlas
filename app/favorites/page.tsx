import React from "react";
import { getSession } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { Heart, Compass, ArrowRight } from "lucide-react";

export default async function FavoritesPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Sign in to view favorites</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Keep track of your favorite restaurants, cafes, and spots by creating or logging into your FoodAtlas account.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: {
      restaurant: {
        include: {
          location: true,
          cuisines: { include: { cuisine: true } },
          menuItems: { take: 2, select: { name: true, veg: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4 fill-orange-600 text-orange-600" />
              <span>Saved Places</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Your Favorite Restaurants
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {favorites.length} saved {favorites.length === 1 ? "restaurant" : "restaurants"}
            </p>
          </div>

          <Link
            href="/search"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
          >
            <Compass className="w-4 h-4 text-orange-600" />
            <span>Discover more</span>
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No saved restaurants yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Whenever you come across a place you want to try or revisit, tap the heart icon on any restaurant card to save it here.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
            >
              <span>Explore Restaurants</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <RestaurantCard
                key={fav.id}
                restaurant={fav.restaurant}
                isInitiallyFavorited={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
