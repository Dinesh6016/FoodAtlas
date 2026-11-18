import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { MenuItemSchema } from "@/lib/validation/schemas";
import { apiSuccess, apiError } from "@/lib/api-response";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const parsed = MenuItemSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation error", "INVALID_INPUT", 422, parsed.error.format());
    }

    const data = parsed.data;

    // Find category to get restaurantId
    const category = await prisma.menuCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return apiError("Category not found", "NOT_FOUND", 404);
    }

    // Verify owner
    const isOwner = await prisma.restaurantOwner.findFirst({
      where: { restaurantId: category.restaurantId, userId: user.id },
    });

    if (!isOwner && user.role !== "ADMIN") {
      return apiError("Unauthorized to manage menu for this restaurant", "FORBIDDEN", 403);
    }

    const slug = `${slugify(data.name)}-${Math.random().toString(36).substring(2, 6)}`;

    const item = await prisma.menuItem.create({
      data: {
        restaurantId: category.restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        discountedPrice: data.discountedPrice,
        veg: data.veg,
        egg: data.egg,
        spicy: data.spicy,
        available: data.available,
        image: data.image || null,
        displayOrder: data.displayOrder,
      },
    });

    return apiSuccess(item, "Menu item created successfully", 201);
  } catch (err: any) {
    console.error("Create menu item error:", err);
    return apiError("Failed to create menu item", "SERVER_ERROR", 500);
  }
}
