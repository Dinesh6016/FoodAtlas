import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import analytics from "@/lib/analytics/analytics-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
        deletedAt: null,
      },
      include: {
        location: true,
        cuisines: { include: { cuisine: true } },
        menuCategories: {
          orderBy: { displayOrder: "asc" },
          include: {
            items: {
              where: { available: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        },
        photos: {
          where: { moderationStatus: "APPROVED" },
          orderBy: { createdAt: "desc" },
        },
        openingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        reviews: {
          where: { moderationStatus: "APPROVED" },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            photos: true,
          },
        },
      },
    });

    if (!restaurant) {
      return apiError("Restaurant not found", "NOT_FOUND", 404);
    }

    // Track analytics view
    const ip = req.headers.get("x-forwarded-for") || undefined;
    analytics.trackView(restaurant.id, undefined, ip);

    return apiSuccess(restaurant);
  } catch (err: any) {
    console.error("Get restaurant error:", err);
    return apiError("Failed to fetch restaurant", "SERVER_ERROR", 500);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getSession();
    if (!user) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    // Verify ownership or admin
    const isOwner = await prisma.restaurantOwner.findFirst({
      where: { restaurantId: id, userId: user.id },
    });

    if (!isOwner && user.role !== "ADMIN") {
      return apiError("You do not have permission to manage this restaurant", "FORBIDDEN", 403);
    }

    const body = await req.json();

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        phone: body.phone,
        email: body.email,
        website: body.website,
        priceRange: body.priceRange ? Number(body.priceRange) : undefined,
        bannerImageUrl: body.bannerImageUrl,
        ...(body.status && user.role === "ADMIN" ? { status: body.status } : {}),
      },
    });

    return apiSuccess(updated, "Restaurant updated successfully");
  } catch (err: any) {
    console.error("Update restaurant error:", err);
    return apiError("Failed to update restaurant", "SERVER_ERROR", 500);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getSession();
    if (!user || user.role !== "ADMIN") {
      return apiError("Only administrators can delete a restaurant", "FORBIDDEN", 403);
    }

    // Soft delete
    await prisma.restaurant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    });

    return apiSuccess(null, "Restaurant removed successfully");
  } catch (err: any) {
    console.error("Delete restaurant error:", err);
    return apiError("Failed to delete restaurant", "SERVER_ERROR", 500);
  }
}
