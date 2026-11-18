import React from "react";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Utensils, QrCode } from "lucide-react";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { MenuEditorClient } from "./menu-editor-client";

interface MenuEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuEditorPage({ params }: MenuEditorPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      owners: true,
      menuCategories: {
        orderBy: { displayOrder: "asc" },
        include: {
          items: {
            orderBy: { displayOrder: "asc" },
          },
        },
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  // Permission check
  const isOwner = restaurant.owners.some((o) => o.userId === session.id);
  if (!isOwner && session.role !== "ADMIN") {
    redirect("/owner/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/owner/dashboard"
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Menu Management
                </span>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  {restaurant.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/menu/${restaurant.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
              >
                <QrCode className="w-4 h-4 text-orange-600" />
                <span>View Public QR Menu</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <MenuEditorClient
          restaurantId={restaurant.id}
          initialCategories={restaurant.menuCategories}
        />
      </div>
    </div>
  );
}
