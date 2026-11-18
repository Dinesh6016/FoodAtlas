"use client";

import React, { useState } from "react";
import { Store, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ClaimClientProps {
  user: any;
  restaurants: any[];
}

export function ClaimClient({ user, restaurants }: ClaimClientProps) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id || "");
  const [ownerName, setOwnerName] = useState(user.name || "");
  const [businessPhone, setBusinessPhone] = useState(user.phone || "");
  const [verificationDocsUrl, setVerificationDocsUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          ownerName,
          businessPhone,
          verificationDocsUrl: verificationDocsUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to submit claim");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">Claim Submitted for Verification</h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
          Our moderation team will review your business proof and phone details within 24–48 hours.
          Once approved, you will have complete ownership access to edit this restaurant and its menus.
        </p>
        <div className="pt-2">
          <Link
            href="/owner/dashboard"
            className="inline-block px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Select Your Restaurant Listing
          </label>
          <select
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            required
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.location?.areaName}, {r.location?.cityName}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400 mt-1">
            Cannot find your restaurant?{" "}
            <Link href="/owner/restaurants/new" className="text-orange-600 font-semibold hover:underline">
              Create a new listing instead →
            </Link>
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Owner / Legal Representative Name
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
            placeholder="e.g. Vikram Oberoi"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Business Contact Phone (for verification OTP/call)
          </label>
          <input
            type="tel"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
            required
            placeholder="+91 9876543210"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Business Proof URL (FSSAI Certificate / GST / Trade License)
          </label>
          <input
            type="url"
            value={verificationDocsUrl}
            onChange={(e) => setVerificationDocsUrl(e.target.value)}
            placeholder="https://drive.google.com/... or uploaded document link"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Additional Verification Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide any additional details or staff contact information..."
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? "Submitting..." : "Submit Claim for Review"}</span>
        </button>
      </form>
    </div>
  );
}
