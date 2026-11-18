import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { ReviewSchema } from "@/lib/validation/schemas";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const reviews = await prisma.review.findMany({
      where: {
        restaurantId: id,
        moderationStatus: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        photos: true,
      },
    });

    return apiSuccess(reviews);
  } catch (err: any) {
    console.error("Get reviews error:", err);
    return apiError("Failed to fetch reviews", "SERVER_ERROR", 500);
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required to submit a review", "UNAUTHORIZED", 401);
    }

    const rateCheck = checkRateLimit(`review:${user.id}`, 5, 300);
    if (!rateCheck.success) {
      return apiError("You have submitted reviews recently. Please wait a few moments.", "RATE_LIMITED", 429);
    }

    const body = await req.json();
    const parsed = ReviewSchema.safeParse({ ...body, restaurantId: id });
    if (!parsed.success) {
      return apiError("Invalid review data", "VALIDATION_ERROR", 422, parsed.error.format());
    }

    const { rating, title, body: reviewBody } = parsed.data;

    // Transaction to insert review and recalculate average rating
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId: user.id,
          restaurantId: id,
          rating,
          title,
          body: reviewBody,
          moderationStatus: "APPROVED",
        },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      // Recalculate average rating & review count
      const aggregates = await tx.review.aggregate({
        where: { restaurantId: id, moderationStatus: "APPROVED" },
        _avg: { rating: true },
        _count: { id: true },
      });

      const newAvg = aggregates._avg.rating ? Math.round(aggregates._avg.rating * 10) / 10 : rating;
      const count = aggregates._count.id;

      await tx.restaurant.update({
        where: { id },
        data: {
          averageRating: newAvg,
          reviewCount: count,
        },
      });

      return review;
    });

    return apiSuccess(result, "Review posted successfully", 201);
  } catch (err: any) {
    console.error("Post review error:", err);
    return apiError("Failed to post review", "SERVER_ERROR", 500);
  }
}
