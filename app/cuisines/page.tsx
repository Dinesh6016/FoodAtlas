import React from "react";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import Image from "next/image";
import { Utensils, ArrowRight } from "lucide-react";

export const revalidate = 300;

export default async function CuisinesDirectoryPage() {
  const cuisines = await prisma.cuisine.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { restaurants: true } },
    },
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Culinary Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Explore All Cuisines
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            From royal Nizami Biryanis and crisp Karnataka dosas to artisanal woodfired pizzas and late-night kebabs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cuisines.map((c) => (
            <Link
              key={c.id}
              href={`/search?cuisine=${c.slug}`}
              className="group bg-white rounded-3xl border border-stone-200 overflow-hidden hover:border-orange-500 hover:shadow-xl transition flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                <Image
                  src={c.imageUrl || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80"}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-stone-900 group-hover:text-orange-600 transition">
                    {c.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-100 text-xs font-semibold">
                  <span className="text-stone-400">{c._count.restaurants} restaurants</span>
                  <span className="text-orange-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
