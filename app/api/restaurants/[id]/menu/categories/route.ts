import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { MenuCategorySchema } from "@/lib/validation/schemas";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const isOwner = await prisma.restaurantOwner.findFirst({
      where: { restaurantId: id, userId: user.id },
    });

    if (!isOwner && user.role !== "ADMIN") {
      return apiError("Unauthorized to manage menu for this restaurant", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const parsed = MenuCategorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation error", "INVALID_INPUT", 422, parsed.error.format());
    }

    const category = await prisma.menuCategory.create({
      data: {
        restaurantId: id,
        name: parsed.data.name,
        description: parsed.data.description,
        displayOrder: parsed.data.displayOrder,
      },
    });

    return apiSuccess(category, "Category created successfully", 201);
  } catch (err: any) {
    console.error("Create category error:", err);
    return apiError("Failed to create category", "SERVER_ERROR", 500);
  }
}
