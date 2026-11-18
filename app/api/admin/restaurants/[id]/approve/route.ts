import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { RestaurantStatus, VerificationStatus } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getSession();
    if (!user || user.role !== "ADMIN") {
      return apiError("Admin access required", "FORBIDDEN", 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "APPROVE"; // APPROVE or REJECT

    const result = await prisma.$transaction(async (tx) => {
      const rest = await tx.restaurant.update({
        where: { id },
        data: {
          status: action === "APPROVE" ? RestaurantStatus.ACTIVE : RestaurantStatus.INACTIVE,
          verificationStatus: action === "APPROVE" ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: action === "APPROVE" ? "RESTAURANT_APPROVED" : "RESTAURANT_REJECTED",
          entityType: "RESTAURANT",
          entityId: id,
          newData: JSON.stringify({ status: rest.status, verificationStatus: rest.verificationStatus }),
        },
      });

      return rest;
    });

    return apiSuccess(result, `Restaurant ${action === "APPROVE" ? "approved" : "rejected"} successfully`);
  } catch (err: any) {
    console.error("Approve restaurant error:", err);
    return apiError("Failed to update restaurant status", "SERVER_ERROR", 500);
  }
}
