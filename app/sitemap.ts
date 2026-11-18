import { MetadataRoute } from "next";
import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://foodatlas.in";

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cuisines`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/cities`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/legal/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: {
        slug: true,
        updatedAt: true,
        location: { select: { cityName: true, areaName: true } },
      },
      take: 100,
    });

    const restaurantPages: MetadataRoute.Sitemap = restaurants.map((r) => {
      const city = slugify(r.location?.cityName || "city");
      const area = slugify(r.location?.areaName || "area");
      return {
        url: `${baseUrl}/restaurants/${city}/${area}/${r.slug}`,
        lastModified: r.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticPages, ...restaurantPages];
  } catch {
    return staticPages;
  }
}
