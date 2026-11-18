import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export interface SearchParams {
  query?: string;
  city?: string;
  area?: string;
  cuisine?: string;
  vegOnly?: boolean;
  nonVegOnly?: boolean;
  minRating?: number;
  priceRanges?: number[]; // [1, 2, 3, 4]
  openNow?: boolean;
  sortBy?: "relevance" | "rating" | "distance" | "popularity" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

export interface SearchResult {
  restaurants: any[];
  total: number;
  page: number;
  totalPages: number;
}

export class SearchService {
  async search(params: SearchParams): Promise<SearchResult> {
    const {
      query = "",
      city,
      area,
      cuisine,
      vegOnly = false,
      nonVegOnly = false,
      minRating = 0,
      priceRanges = [],
      sortBy = "relevance",
      page = 1,
      limit = 12,
      lat,
      lng,
    } = params;

    const skip = (page - 1) * limit;
    const cleanQuery = query.trim();

    // Build Prisma where clause
    const where: Prisma.RestaurantWhereInput = {
      status: "ACTIVE",
      deletedAt: null,
    };

    // City & Area filter
    if (city) {
      where.location = {
        ...(where.location as any),
        cityName: { equals: city, mode: "insensitive" },
      };
    }

    if (area) {
      where.location = {
        ...(where.location as any),
        areaName: { equals: area, mode: "insensitive" },
      };
    }

    // Rating filter
    if (minRating > 0) {
      where.averageRating = { gte: minRating };
    }

    // Price range filter
    if (priceRanges.length > 0) {
      where.priceRange = { in: priceRanges };
    }

    // Cuisine filter
    if (cuisine) {
      where.cuisines = {
        some: {
          cuisine: {
            OR: [
              { slug: { equals: cuisine, mode: "insensitive" } },
              { name: { equals: cuisine, mode: "insensitive" } },
            ],
          },
        },
      };
    }

    // Veg / Non-veg preference in menu items
    if (vegOnly) {
      where.menuItems = {
        some: {
          veg: true,
        },
      };
    }

    // Query matching (Restaurant Name, Description, Cuisines, Dish names, or Area)
    if (cleanQuery) {
      where.OR = [
        { name: { contains: cleanQuery, mode: "insensitive" } },
        { description: { contains: cleanQuery, mode: "insensitive" } },
        {
          cuisines: {
            some: {
              cuisine: {
                name: { contains: cleanQuery, mode: "insensitive" },
              },
            },
          },
        },
        {
          location: {
            OR: [
              { areaName: { contains: cleanQuery, mode: "insensitive" } },
              { cityName: { contains: cleanQuery, mode: "insensitive" } },
              { address: { contains: cleanQuery, mode: "insensitive" } },
            ],
          },
        },
        {
          menuItems: {
            some: {
              name: { contains: cleanQuery, mode: "insensitive" },
            },
          },
        },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.RestaurantOrderByWithRelationInput = { averageRating: "desc" };
    if (sortBy === "rating") {
      orderBy = { averageRating: "desc" };
    } else if (sortBy === "popularity") {
      orderBy = { reviewCount: "desc" };
    } else if (sortBy === "price_asc") {
      orderBy = { priceRange: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { priceRange: "desc" };
    }

    // Execute query with selective fields to avoid N+1 and heavy loads
    const [total, rawRestaurants] = await Promise.all([
      prisma.restaurant.count({ where }),
      prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          phone: true,
          priceRange: true,
          averageRating: true,
          reviewCount: true,
          bannerImageUrl: true,
          status: true,
          verificationStatus: true,
          location: {
            select: {
              address: true,
              cityName: true,
              areaName: true,
              latitude: true,
              longitude: true,
            },
          },
          cuisines: {
            select: {
              cuisine: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          menuItems: {
            take: 3,
            select: {
              id: true,
              name: true,
              price: true,
              veg: true,
              image: true,
            },
          },
          openingHours: {
            select: {
              dayOfWeek: true,
              openTime: true,
              closeTime: true,
              isClosed: true,
            },
          },
        },
      }),
    ]);

    // Calculate approximate distance if lat/lng are provided
    const restaurantsWithMeta = rawRestaurants.map((r) => {
      let distanceKm: number | null = null;
      if (lat && lng && r.location) {
        // Haversine formula calculation
        const R = 6371; // km
        const dLat = ((r.location.latitude - lat) * Math.PI) / 180;
        const dLon = ((r.location.longitude - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((r.location.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = Math.round(R * c * 10) / 10;
      }

      // Check current open/closed status
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeNum = currentHour * 60 + currentMinute;

      const todayHours = r.openingHours.find((h) => h.dayOfWeek === currentDay);
      let isOpenNow = true;
      if (todayHours) {
        if (todayHours.isClosed) {
          isOpenNow = false;
        } else {
          const [openH, openM] = todayHours.openTime.split(":").map(Number);
          const [closeH, closeM] = todayHours.closeTime.split(":").map(Number);
          const openNum = openH * 60 + openM;
          const closeNum = closeH * 60 + closeM;
          isOpenNow = currentTimeNum >= openNum && currentTimeNum <= closeNum;
        }
      }

      return {
        ...r,
        distanceKm,
        isOpenNow,
      };
    });

    // If sorting by distance and lat/lng provided
    if (sortBy === "distance" && lat && lng) {
      restaurantsWithMeta.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return {
      restaurants: restaurantsWithMeta,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Dish-level search
  async searchDishes(query: string, city?: string) {
    return prisma.menuItem.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        available: true,
        restaurant: {
          status: "ACTIVE",
          ...(city ? { location: { cityName: { equals: city, mode: "insensitive" } } } : {}),
        },
      },
      take: 20,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        veg: true,
        image: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            averageRating: true,
            location: {
              select: {
                cityName: true,
                areaName: true,
              },
            },
          },
        },
      },
    });
  }
}

export const searchService = new SearchService();
export default searchService;
