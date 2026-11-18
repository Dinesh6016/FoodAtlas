import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://foodatlas.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/restaurants/", "/search", "/cuisines", "/cities", "/menu/"],
        disallow: ["/admin/", "/owner/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
