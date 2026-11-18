import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { OwnerClaimSchema } from "@/lib/validation/schemas";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ClaimStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const parsed = OwnerClaimSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid claim data", "VALIDATION_ERROR", 422, parsed.error.format());
    }

    const { restaurantId, ownerName, businessPhone, verificationDocsUrl, notes } = parsed.data;

    // Check if pending claim already exists
    const existing = await prisma.ownerClaim.findFirst({
      where: {
        restaurantId,
        userId: user.id,
        status: ClaimStatus.PENDING,
      },
    });

    if (existing) {
      return apiError("A verification request is already pending for this restaurant", "CLAIM_EXISTS", 409);
    }

    const claim = await prisma.ownerClaim.create({
      data: {
        userId: user.id,
        restaurantId,
        ownerName,
        businessPhone,
        verificationDocsUrl,
        notes,
        status: ClaimStatus.PENDING,
      },
    });

    return apiSuccess(claim, "Ownership verification claim submitted for admin review", 201);
  } catch (err: any) {
    console.error("Owner claim error:", err);
    return apiError("Failed to submit claim", "SERVER_ERROR", 500);
  }
}
