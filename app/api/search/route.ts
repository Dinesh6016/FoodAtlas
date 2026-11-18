import { NextRequest } from "next/server";
import searchService from "@/lib/search/search-service";
import { apiSuccess, apiError } from "@/lib/api-response";
import analytics from "@/lib/analytics/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || undefined;
    const area = searchParams.get("area") || undefined;
    const cuisine = searchParams.get("cuisine") || undefined;
    const vegOnly = searchParams.get("vegOnly") === "true";
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : 0;
    const priceRanges = searchParams.get("priceRange")
      ? searchParams.get("priceRange")!.split(",").map(Number).filter((n) => !isNaN(n))
      : [];
    const sortBy = (searchParams.get("sortBy") as any) || "relevance";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 12;
    const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined;
    const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined;

    const result = await searchService.search({
      query,
      city,
      area,
      cuisine,
      vegOnly,
      minRating,
      priceRanges,
      sortBy,
      page,
      limit,
      lat,
      lng,
    });

    if (query) {
      analytics.trackSearch(query, city || area, result.total);
    }

    return apiSuccess(result);
  } catch (err: any) {
    console.error("Search API error:", err);
    return apiError("Failed to perform search", "SEARCH_ERROR", 500);
  }
}
