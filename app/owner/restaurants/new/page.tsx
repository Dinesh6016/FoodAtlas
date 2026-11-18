import React from "react";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { CreateRestaurantForm } from "./create-restaurant-form";

export default async function NewRestaurantPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const cuisines = await prisma.cuisine.findMany({
    orderBy: { name: "asc" },
  });

  const cities = await prisma.city.findMany({
    include: { areas: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/owner/dashboard"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Listing Creation
              </span>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                Add New Restaurant
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <CreateRestaurantForm
          cuisines={cuisines}
          cities={cities}
        />
      </div>
    </div>
  );
}
