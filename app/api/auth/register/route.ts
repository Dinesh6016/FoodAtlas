import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { SignupSchema } from "@/lib/validation/schemas";
import { hashPassword, setSessionCookie } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Validation failed", "INVALID_INPUT", 422, parsed.error.format());
    }

    const { name, email, password, role, phone } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return apiError("An account with this email already exists", "EMAIL_EXISTS", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role as Role,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    await setSessionCookie(user);

    return apiSuccess(user, "User registered successfully", 201);
  } catch (err: any) {
    console.error("Register error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
