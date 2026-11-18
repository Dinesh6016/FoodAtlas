"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  MapPin,
  Search,
  Heart,
  User,
  Shield,
  Store,
  LogOut,
  Menu as MenuIcon,
  X,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  initialUser?: any;
}

export function Navbar({ initialUser }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(initialUser || null);
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  useEffect(() => {
    // If not passed initially, fetch session client-side
    if (!initialUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUser(data.data);
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() && !selectedCity) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedCity)}`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  };

  const cities = ["Hyderabad", "Bengaluru", "Mumbai"];

  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 group-hover:text-orange-600 transition-colors">
                  Food<span className="text-orange-600">Atlas</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 -mt-1 hidden sm:block">
                  Culinary Discovery
                </span>
              </div>
            </Link>

            {/* City Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200/70 text-stone-700 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white border border-stone-200 rounded-xl shadow-xl py-1 z-50">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-orange-50 hover:text-orange-600 transition ${
                        selectedCity === city ? "text-orange-600 font-bold bg-orange-50/50" : "text-stone-700"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, biryani, pizza, cuisines..."
                className="w-full bg-stone-100 hover:bg-stone-100/80 focus:bg-white text-sm text-stone-900 placeholder:text-stone-400 pl-10 pr-4 py-2 rounded-full border border-stone-200/80 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </form>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/favorites"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-orange-600 hover:bg-stone-100 transition"
            >
              <Heart className="w-4 h-4" />
              <span>Saved</span>
            </Link>

            {user?.role === "OWNER" || user?.role === "ADMIN" ? (
              <Link
                href="/owner/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
              >
                <Store className="w-4 h-4 text-orange-600" />
                <span>Owner Portal</span>
              </Link>
            ) : (
              <Link
                href="/owner/claim"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
              >
                <Store className="w-4 h-4 text-stone-400" />
                <span>For Restaurants</span>
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center border border-orange-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-stone-800 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-orange-600 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm shadow-orange-500/20 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/favorites"
              className="p-2 text-stone-600 hover:text-orange-600"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food, places, cuisines..."
              className="w-full bg-stone-100 text-sm pl-9 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none"
            />
          </form>

          {/* City select in mobile */}
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">City</span>
            <div className="flex gap-1">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                    selectedCity === c ? "bg-orange-600 text-white" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-700 font-medium hover:bg-stone-50"
            >
              <Compass className="w-5 h-5 text-orange-600" />
              <span>Explore Restaurants</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-700 font-medium hover:bg-stone-50"
            >
              <Heart className="w-5 h-5 text-red-500" />
              <span>Saved Places</span>
            </Link>
            <Link
              href="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-700 font-medium hover:bg-stone-50"
            >
              <Store className="w-5 h-5 text-stone-600" />
              <span>Restaurant Owner Portal</span>
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-amber-800 font-medium bg-amber-50"
              >
                <Shield className="w-5 h-5 text-amber-600" />
                <span>Admin Moderation</span>
              </Link>
            )}

            {user ? (
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 font-semibold px-3 py-1 bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-200">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-stone-700 bg-stone-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-orange-600 rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
