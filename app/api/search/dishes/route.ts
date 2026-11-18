import { NextRequest } from "next/server";
import searchService from "@/lib/search/search-service";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || undefined;

    if (!query) {
      return apiSuccess([]);
    }

    const dishes = await searchService.searchDishes(query, city);
    return apiSuccess(dishes);
  } catch (err: any) {
    console.error("Dish search error:", err);
    return apiError("Failed to search dishes", "SEARCH_ERROR", 500);
  }
}
