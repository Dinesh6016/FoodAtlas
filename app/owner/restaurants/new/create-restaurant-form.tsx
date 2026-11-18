"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Send, Check, AlertCircle } from "lucide-react";

interface CreateRestaurantFormProps {
  cuisines: any[];
  cities: any[];
}

export function CreateRestaurantForm({ cuisines, cities }: CreateRestaurantFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [priceRange, setPriceRange] = useState(2);
  const [bannerImageUrl, setBannerImageUrl] = useState("");

  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id || "");
  const selectedCity = cities.find((c) => c.id === selectedCityId) || cities[0];
  const [selectedAreaName, setSelectedAreaName] = useState(selectedCity?.areas[0]?.name || "");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("500001");
  const [latitude, setLatitude] = useState(selectedCity?.latitude || 17.4168);
  const [longitude, setLongitude] = useState(selectedCity?.longitude || 78.4382);

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const c = cities.find((ci) => ci.id === cityId);
    if (c) {
      setSelectedAreaName(c.areas[0]?.name || "");
      setLatitude(c.latitude);
      setLongitude(c.longitude);
      setPostalCode(c.areas[0]?.postalCode || "500001");
    }
  };

  const toggleCuisine = (cid: string) => {
    if (selectedCuisines.includes(cid)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cid));
    } else {
      setSelectedCuisines([...selectedCuisines, cid]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCuisines.length === 0) {
      setError("Please select at least one cuisine type.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          website: website.trim() || undefined,
          priceRange,
          bannerImageUrl: bannerImageUrl.trim() || undefined,
          cityName: selectedCity.name,
          areaName: selectedAreaName,
          state: selectedCity.state,
          address: address.trim(),
          landmark: landmark.trim() || undefined,
          postalCode: postalCode.trim(),
          latitude: Number(latitude),
          longitude: Number(longitude),
          cuisineIds: selectedCuisines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create restaurant listing");

      router.push(`/owner/restaurants/${data.data.id}/menu`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
            1. Restaurant Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Nawabs Biryani & Grills"
                required
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Tagline or Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your culinary heritage, ambiance, specialties, and dining experience..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                required
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@restaurant.com"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Price for Two Category
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none bg-white"
              >
                <option value={1}>₹ — Budget (Under ₹300 for two)</option>
                <option value={2}>₹₹ — Moderate (₹300 – ₹800 for two)</option>
                <option value={3}>₹₹₹ — Upscale (₹800 – ₹1,500 for two)</option>
                <option value={4}>₹₹₹₹ — Fine Dining (₹1,500+ for two)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Hero Banner Photo URL
              </label>
              <input
                type="url"
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location & Address */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
            2. Location & Address Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                City
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none bg-white"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Area / Neighborhood
              </label>
              <select
                value={selectedAreaName}
                onChange={(e) => setSelectedAreaName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none bg-white"
              >
                {selectedCity.areas.map((a: any) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot 42, Road 12, Main Commercial Avenue"
                required
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Opposite Metro Pillar 32"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                placeholder="500034"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Cuisines Selection */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
            3. Select Cuisines (At least 1)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {cuisines.map((c) => {
              const isSelected = selectedCuisines.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCuisine(c.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold text-center transition flex items-center justify-between gap-1 ${
                    isSelected
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? "Creating Listing..." : "Create Restaurant & Proceed to Menu"}</span>
        </button>
      </form>
    </div>
  );
}
