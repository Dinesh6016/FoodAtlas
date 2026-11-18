import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RestaurantRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { location: true },
  });

  if (!restaurant) {
    notFound();
  }

  const city = slugify(restaurant.location?.cityName || "city");
  const area = slugify(restaurant.location?.areaName || "area");

  redirect(`/restaurants/${city}/${area}/${restaurant.slug}`);
}
