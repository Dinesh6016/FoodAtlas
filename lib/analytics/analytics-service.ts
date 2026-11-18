import prisma from "@/lib/db/prisma";

export class AnalyticsService {
  async trackView(restaurantId: string, userId?: string, ipAddress?: string, referrer?: string) {
    try {
      await prisma.restaurantView.create({
        data: {
          restaurantId,
          userId,
          ipAddress,
          referrer,
        },
      });
    } catch (e) {
      // Fire-and-forget logging; avoid breaking request pipeline
    }
  }

  async trackSearch(query: string, location?: string, resultsCount: number = 0, userId?: string) {
    try {
      await prisma.searchEvent.create({
        data: {
          query,
          location,
          resultsCount,
          userId,
        },
      });
    } catch (e) {
      // Fail silently
    }
  }
}

export const analytics = new AnalyticsService();
export default analytics;
