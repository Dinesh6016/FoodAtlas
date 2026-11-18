import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteContext {
  params: Promise<{ restaurantId: string }>;
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { restaurantId } = await context.params;
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        restaurantId,
      },
    });

    return apiSuccess(null, "Removed from favorites");
  } catch (err: any) {
    console.error("Delete favorite error:", err);
    return apiError("Failed to remove favorite", "SERVER_ERROR", 500);
  }
}
