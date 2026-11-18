import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { LoginSchema } from "@/lib/validation/schemas";
import { verifyPassword, setSessionCookie } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60);
    if (!rateCheck.success) {
      return apiError("Too many login attempts. Please try again later.", "RATE_LIMITED", 429);
    }

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid credentials provided", "INVALID_INPUT", 422);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return apiError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return apiError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    await setSessionCookie(sessionUser);

    return apiSuccess(sessionUser, "Login successful");
  } catch (err: any) {
    console.error("Login error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
