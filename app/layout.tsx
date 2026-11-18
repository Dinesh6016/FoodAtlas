import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { getSession } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "FoodAtlas | Discover Great Food & Authentic Restaurants in India",
  description:
    "Explore top restaurants, complete menus, authentic cuisines, dishes, and culinary gems across Hyderabad, Bengaluru, Mumbai, and beyond.",
  keywords: [
    "FoodAtlas",
    "Restaurant discovery India",
    "Biryani Hyderabad",
    "Bengaluru cafes",
    "Mumbai seafood",
    "Online menus",
    "Best restaurants near me",
  ],
  authors: [{ name: "FoodAtlas Team" }],
  openGraph: {
    title: "FoodAtlas — Discover Great Food Near You",
    description: "Explore curated restaurants, menus, dishes, and verified culinary places.",
    url: "https://foodatlas.in",
    siteName: "FoodAtlas",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodAtlas — Discover Great Food Near You",
    description: "Explore curated restaurants, menus, dishes, and verified culinary places in India.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-full flex-col bg-stone-50 text-stone-900 antialiased">
        <Suspense fallback={<div className="h-16 sm:h-20 bg-white border-b border-stone-200" />}>
          <Navbar initialUser={session} />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
