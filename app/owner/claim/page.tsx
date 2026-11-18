import React from "react";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClaimClient } from "./claim-client";
import { Store, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function ClaimPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Get active restaurants for claim dropdown / search
  const availableRestaurants = await prisma.restaurant.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
    },
    take: 50,
    select: {
      id: true,
      name: true,
      slug: true,
      location: {
        select: {
          cityName: true,
          areaName: true,
          address: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-white border-b border-stone-200 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Claim Your Restaurant on FoodAtlas
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
            Take official ownership of your restaurant listing. Update menus, manage opening hours,
            respond to diner reviews, and get verified badge credibility.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-10">
        <ClaimClient
          user={session}
          restaurants={availableRestaurants}
        />
      </div>
    </div>
  );
}
