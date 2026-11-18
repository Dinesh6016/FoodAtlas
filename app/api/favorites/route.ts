import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        restaurant: {
          include: {
            location: true,
            cuisines: { include: { cuisine: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(favorites);
  } catch (err: any) {
    console.error("Get favorites error:", err);
    return apiError("Failed to fetch favorites", "SERVER_ERROR", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const { restaurantId } = body;

    if (!restaurantId) {
      return apiError("restaurantId is required", "INVALID_INPUT", 400);
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_restaurantId: {
          userId: user.id,
          restaurantId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        restaurantId,
      },
    });

    return apiSuccess(favorite, "Restaurant added to favorites", 201);
  } catch (err: any) {
    console.error("Add favorite error:", err);
    return apiError("Failed to save favorite", "SERVER_ERROR", 500);
  }
}
