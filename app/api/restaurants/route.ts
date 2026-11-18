import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { RestaurantSchema } from "@/lib/validation/schemas";
import { apiSuccess, apiError } from "@/lib/api-response";
import { slugify } from "@/lib/utils";
import { RestaurantStatus, VerificationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const limit = Number(searchParams.get("limit")) || 20;

    const restaurants = await prisma.restaurant.findMany({
      where: {
        status: RestaurantStatus.ACTIVE,
        deletedAt: null,
        ...(city ? { location: { cityName: { equals: city, mode: "insensitive" } } } : {}),
      },
      take: limit,
      orderBy: { averageRating: "desc" },
      include: {
        location: true,
        cuisines: { include: { cuisine: true } },
        openingHours: true,
      },
    });

    return apiSuccess(restaurants);
  } catch (err: any) {
    console.error("List restaurants error:", err);
    return apiError("Failed to fetch restaurants", "SERVER_ERROR", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required to list a restaurant", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const parsed = RestaurantSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid restaurant data", "VALIDATION_ERROR", 422, parsed.error.format());
    }

    const data = parsed.data;
    const baseSlug = slugify(data.name);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Database transaction: create restaurant, location, owner link, and audit log
    const newRestaurant = await prisma.$transaction(async (tx) => {
      const rest = await tx.restaurant.create({
        data: {
          name: data.name,
          slug: uniqueSlug,
          description: data.description,
          phone: data.phone,
          email: data.email || null,
          website: data.website || null,
          priceRange: data.priceRange,
          bannerImageUrl: data.bannerImageUrl || null,
          status: user.role === "ADMIN" ? RestaurantStatus.ACTIVE : RestaurantStatus.PENDING_APPROVAL,
          verificationStatus: user.role === "ADMIN" ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
          dataProvenance: user.role === "ADMIN" ? "ADMIN_ONBOARDED" : "OWNER_SUBMISSION",
          location: {
            create: {
              address: data.address,
              landmark: data.landmark,
              cityName: data.cityName,
              areaName: data.areaName,
              state: data.state,
              country: "India",
              postalCode: data.postalCode,
              latitude: data.latitude,
              longitude: data.longitude,
            },
          },
          owners: {
            create: {
              userId: user.id,
              isPrimary: true,
            },
          },
          cuisines: {
            create: data.cuisineIds.map((cid) => ({
              cuisine: { connect: { id: cid } },
            })),
          },
          openingHours: {
            createMany: {
              data: [
                { dayOfWeek: 0, openTime: "11:00", closeTime: "23:00", isClosed: false },
                { dayOfWeek: 1, openTime: "11:00", closeTime: "23:00", isClosed: false },
                { dayOfWeek: 2, openTime: "11:00", closeTime: "23:00", isClosed: false },
                { dayOfWeek: 3, openTime: "11:00", closeTime: "23:00", isClosed: false },
                { dayOfWeek: 4, openTime: "11:00", closeTime: "23:00", isClosed: false },
                { dayOfWeek: 5, openTime: "11:00", closeTime: "23:00", isClosed: false },
                { dayOfWeek: 6, openTime: "11:00", closeTime: "23:00", isClosed: false },
              ],
            },
          },
        },
        include: {
          location: true,
          cuisines: { include: { cuisine: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "RESTAURANT_CREATED",
          entityType: "RESTAURANT",
          entityId: rest.id,
          newData: JSON.stringify({ name: rest.name, slug: rest.slug }),
        },
      });

      return rest;
    });

    return apiSuccess(newRestaurant, "Restaurant listed successfully", 201);
  } catch (err: any) {
    console.error("Create restaurant error:", err);
    return apiError("Failed to create restaurant listing", "SERVER_ERROR", 500);
  }
}
