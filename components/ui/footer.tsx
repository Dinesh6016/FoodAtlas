import React from "react";
import Link from "next/link";
import { Compass, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Food<span className="text-orange-500">Atlas</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              FoodAtlas is India's premium restaurant and culinary discovery platform.
              Explore authentic menus, signature dishes, verified reviews, and verified dining places across top cities.
            </p>
            <div className="text-xs text-stone-500 flex items-center gap-1 pt-2">
              <span>Crafted for food lovers with</span>
              <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500 inline" />
              <span>across India</span>
            </div>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Explore Cities
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/search?city=Hyderabad" className="hover:text-orange-400 transition">
                  Hyderabad Restaurants
                </Link>
              </li>
              <li>
                <Link href="/search?city=Bengaluru" className="hover:text-orange-400 transition">
                  Bengaluru Eateries
                </Link>
              </li>
              <li>
                <Link href="/search?city=Mumbai" className="hover:text-orange-400 transition">
                  Mumbai Dining
                </Link>
              </li>
              <li>
                <Link href="/cities" className="text-stone-400 hover:text-white transition text-xs font-medium">
                  View all cities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cuisines */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Trending Cuisines
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/search?cuisine=biryani" className="hover:text-orange-400 transition">
                  Hyderabadi Biryani
                </Link>
              </li>
              <li>
                <Link href="/search?cuisine=south-indian" className="hover:text-orange-400 transition">
                  Crispy Dosas & South
                </Link>
              </li>
              <li>
                <Link href="/search?cuisine=italian" className="hover:text-orange-400 transition">
                  Woodfired Pizza & Pasta
                </Link>
              </li>
              <li>
                <Link href="/search?cuisine=cafe" className="hover:text-orange-400 transition">
                  Specialty Coffee & Cafes
                </Link>
              </li>
              <li>
                <Link href="/cuisines" className="text-stone-400 hover:text-white transition text-xs font-medium">
                  All 15+ Cuisines →
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business & Legal */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              For Restaurants
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/owner/claim" className="hover:text-orange-400 transition">
                  Claim Your Listing
                </Link>
              </li>
              <li>
                <Link href="/owner/dashboard" className="hover:text-orange-400 transition">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-orange-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-orange-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/content-policy" className="hover:text-orange-400 transition">
                  Content & Photo Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} FoodAtlas Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-stone-400 transition">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-stone-400 transition">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-stone-400 transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
