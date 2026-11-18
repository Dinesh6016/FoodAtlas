import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ClaimStatus, Role } from "@prisma/client";

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
    const notes = body.notes || "";

    const claim = await prisma.ownerClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      return apiError("Claim not found", "NOT_FOUND", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ownerClaim.update({
        where: { id },
        data: {
          status: action === "APPROVE" ? ClaimStatus.APPROVED : ClaimStatus.REJECTED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          notes: notes || claim.notes,
        },
      });

      if (action === "APPROVE") {
        // Associate user as owner of restaurant
        await tx.restaurantOwner.upsert({
          where: {
            restaurantId_userId: {
              restaurantId: claim.restaurantId,
              userId: claim.userId,
            },
          },
          update: { isPrimary: true },
          create: {
            restaurantId: claim.restaurantId,
            userId: claim.userId,
            isPrimary: true,
          },
        });

        // Upgrade user role to OWNER if currently USER
        await tx.user.update({
          where: { id: claim.userId },
          data: { role: Role.OWNER },
        });

        // Mark restaurant as verified
        await tx.restaurant.update({
          where: { id: claim.restaurantId },
          data: { verificationStatus: "VERIFIED" },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: action === "APPROVE" ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
          entityType: "OWNER_CLAIM",
          entityId: id,
          newData: JSON.stringify({ action, notes }),
        },
      });
    });

    return apiSuccess(null, `Claim ${action === "APPROVE" ? "approved" : "rejected"} successfully`);
  } catch (err: any) {
    console.error("Review claim error:", err);
    return apiError("Failed to review claim", "SERVER_ERROR", 500);
  }
}
