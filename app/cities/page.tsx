import React from "react";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

export const revalidate = 300;

export default async function CitiesDirectoryPage() {
  const cities = await prisma.city.findMany({
    include: {
      areas: {
        orderBy: { name: "asc" },
      },
      _count: { select: { restaurants: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            City Hubs
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Discover Food by City & Area
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Explore dining scenes across India&apos;s culinary metropolises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cities.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-stone-900">{city.name}</h3>
                  <span className="text-xs text-stone-400 font-medium">{city.state}, {city.country}</span>
                </div>
                <Link
                  href={`/search?city=${encodeURIComponent(city.name)}`}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition"
                >
                  All Places →
                </Link>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Popular Neighborhoods
                </h4>
                <div className="space-y-1.5">
                  {city.areas.map((area) => (
                    <Link
                      key={area.id}
                      href={`/search?city=${encodeURIComponent(city.name)}&area=${encodeURIComponent(area.name)}`}
                      className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-orange-600 transition"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{area.name}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
