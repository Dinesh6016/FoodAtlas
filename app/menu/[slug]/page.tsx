import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { Compass, Sparkles, MapPin, Phone } from "lucide-react";

interface QRMenuPageProps {
  params: Promise<{ slug: string }>;
}

export default async function QRMenuPage({ params }: QRMenuPageProps) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      location: true,
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
    },
  });

  if (!restaurant || restaurant.deletedAt) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-20">
      {/* Top Banner / Restaurant Info */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {restaurant.bannerImageUrl && (
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                <Image
                  src={restaurant.bannerImageUrl}
                  alt={restaurant.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="font-black text-stone-900 text-base leading-tight truncate max-w-[200px] sm:max-w-md">
                {restaurant.name}
              </h1>
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-600" />
                <span>{restaurant.location?.areaName}, {restaurant.location?.cityName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              Live Digital Menu
            </span>
          </div>
        </div>

        {/* Sticky Category Jump Navigation */}
        <div className="border-t border-stone-100 bg-stone-50/80 backdrop-blur-md overflow-x-auto py-2.5 px-4 scrollbar-none">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            {restaurant.menuCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="px-3 py-1 rounded-full bg-white text-stone-700 hover:text-orange-600 text-xs font-semibold shrink-0 border border-stone-200 shadow-sm active:scale-95 transition"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Categories and Items Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
        {restaurant.menuCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-stone-500 border border-stone-200">
            No items are currently listed on this menu.
          </div>
        ) : (
          restaurant.menuCategories.map((category) => (
            <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-28 space-y-3">
              <div className="flex items-baseline justify-between border-b border-stone-300 pb-1.5">
                <h2 className="font-black text-lg text-stone-900 tracking-tight">
                  {category.name}
                </h2>
                <span className="text-xs font-semibold text-stone-400">
                  {category.items.length} items
                </span>
              </div>

              {category.description && (
                <p className="text-xs text-stone-500 italic">{category.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {category.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Footer info */}
        <div className="text-center pt-8 pb-4 text-xs text-stone-400 space-y-1">
          <p>Powered by FoodAtlas Digital QR Technology</p>
          <p>Prices are subject to applicable taxes and restaurant charges.</p>
        </div>
      </main>
    </div>
  );
}
