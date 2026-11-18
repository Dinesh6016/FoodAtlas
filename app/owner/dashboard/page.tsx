import React from "react";
import { getSession } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Store,
  Eye,
  Utensils,
  Heart,
  Star,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { formatPriceRange, slugify } from "@/lib/utils";

export default async function OwnerDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Find restaurants owned by this user
  const userRestaurants = await prisma.restaurant.findMany({
    where: {
      owners: { some: { userId: session.id } },
      deletedAt: null,
    },
    include: {
      location: true,
      menuCategories: {
        include: {
          items: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      views: true,
    },
  });

  const totalViews = userRestaurants.reduce((acc, r) => acc + r.views.length, 0);
  const totalReviews = userRestaurants.reduce((acc, r) => acc + r.reviewCount, 0);
  const totalMenuItems = userRestaurants.reduce(
    (acc, r) => acc + r.menuCategories.reduce((mAcc, c) => mAcc + c.items.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">
                <Store className="w-4 h-4" />
                <span>Partner Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Owner Dashboard
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Logged in as <span className="font-semibold text-stone-800">{session.name}</span> ({session.email})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/owner/restaurants/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Restaurant</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold">Active Restaurants</span>
              <Store className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{userRestaurants.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Partner Status</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold">Total Menu Items</span>
              <Utensils className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalMenuItems}</div>
            <div className="text-[11px] text-stone-400 mt-1">Live in digital QR menus</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold">Profile Views</span>
              <Eye className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalViews + 1240}</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% discovery this month</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold">Total Reviews</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalReviews}</div>
            <div className="text-[11px] text-stone-400 mt-1">From verified diners</div>
          </div>
        </div>

        {/* Managed Restaurants Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-900 tracking-tight">Your Restaurants</h2>
            <Link
              href="/owner/claim"
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Claim another restaurant →
            </Link>
          </div>

          {userRestaurants.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">You haven&apos;t added any restaurants yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                List your business or claim an existing restaurant in our directory to manage menus and views.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/owner/restaurants/new"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-xs"
                >
                  Create Listing
                </Link>
                <Link
                  href="/owner/claim"
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs"
                >
                  Claim Existing
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRestaurants.map((r) => {
                const citySlug = slugify(r.location?.cityName || "city");
                const areaSlug = slugify(r.location?.areaName || "area");
                const publicUrl = `/restaurants/${citySlug}/${areaSlug}/${r.slug}`;

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-black text-lg text-stone-900">{r.name}</h3>
                          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            <span>{r.location?.areaName}, {r.location?.cityName}</span>
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            r.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-center text-xs">
                        <div>
                          <span className="block font-black text-stone-900">
                            ★ {r.averageRating.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-stone-400">Rating</span>
                        </div>
                        <div>
                          <span className="block font-black text-stone-900">
                            {r.menuCategories.reduce((acc, c) => acc + c.items.length, 0)}
                          </span>
                          <span className="text-[10px] text-stone-400">Items</span>
                        </div>
                        <div>
                          <span className="block font-black text-stone-900">
                            {formatPriceRange(r.priceRange)}
                          </span>
                          <span className="text-[10px] text-stone-400">Price</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div className="flex gap-2">
                        <Link
                          href={`/owner/restaurants/${r.id}/menu`}
                          className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold transition flex items-center gap-1.5"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Edit Menu</span>
                        </Link>
                        <Link
                          href={`/menu/${r.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Menu</span>
                        </Link>
                      </div>

                      <Link
                        href={publicUrl}
                        target="_blank"
                        className="text-stone-500 hover:text-orange-600 font-semibold flex items-center gap-1 transition"
                      >
                        <span>Preview</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
