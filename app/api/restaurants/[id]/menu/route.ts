import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        bannerImageUrl: true,
        location: {
          select: {
            cityName: true,
            areaName: true,
            address: true,
          },
        },
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

    if (!restaurant) {
      return apiError("Restaurant not found", "NOT_FOUND", 404);
    }

    return apiSuccess(restaurant);
  } catch (err: any) {
    console.error("Get menu error:", err);
    return apiError("Failed to fetch menu", "SERVER_ERROR", 500);
  }
}
