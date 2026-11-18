import { getSession } from "@/lib/auth/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return apiError("Not authenticated", "UNAUTHENTICATED", 401);
  }
  return apiSuccess(user);
}
