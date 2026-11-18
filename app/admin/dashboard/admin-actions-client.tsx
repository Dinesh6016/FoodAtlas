"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Store, FileCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

interface AdminActionsClientProps {
  pendingRestaurants: any[];
  pendingClaims: any[];
}

export function AdminActionsClient({
  pendingRestaurants: initialRestaurants,
  pendingClaims: initialClaims,
}: AdminActionsClientProps) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [claims, setClaims] = useState(initialClaims);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRestaurantAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/restaurants/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed action");

      setRestaurants(restaurants.filter((r) => r.id !== id));
      setMessage(`Restaurant ${action === "APPROVE" ? "approved" : "rejected"} successfully.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleClaimAction = async (claimId: string, action: "APPROVE" | "REJECT") => {
    setLoadingId(claimId);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed claim review");

      setClaims(claims.filter((c) => c.id !== claimId));
      setMessage(`Claim ${action === "APPROVE" ? "approved" : "rejected"} successfully.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Pending Restaurants Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-base text-stone-900">
              Pending Restaurant Approvals ({restaurants.length})
            </h3>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <p className="text-xs text-stone-400 py-3 italic">
            No restaurant listings currently waiting for approval.
          </p>
        ) : (
          <div className="space-y-3">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-stone-200 bg-stone-50/50"
              >
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{r.name}</h4>
                  <p className="text-xs text-stone-500">
                    {r.location?.address}, {r.location?.areaName}, {r.location?.cityName}
                  </p>
                  <span className="text-[10px] font-semibold text-stone-400">
                    Phone: {r.phone} • Submitted: {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestaurantAction(r.id, "APPROVE")}
                    disabled={loadingId === r.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRestaurantAction(r.id, "REJECT")}
                    disabled={loadingId === r.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Owner Claims Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-base text-stone-900">
              Pending Business Owner Claims ({claims.length})
            </h3>
          </div>
        </div>

        {claims.length === 0 ? (
          <p className="text-xs text-stone-400 py-3 italic">
            No ownership verification claims currently pending.
          </p>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-stone-200 bg-stone-50/50"
              >
                <div>
                  <h4 className="font-bold text-sm text-stone-900">
                    Claim for: {claim.restaurant?.name}
                  </h4>
                  <p className="text-xs text-stone-600">
                    Claimant: <span className="font-semibold">{claim.ownerName}</span> ({claim.user?.email}) • Phone: {claim.businessPhone}
                  </p>
                  {claim.notes && (
                    <p className="text-[11px] text-stone-500 mt-1 italic">
                      Notes: {claim.notes}
                    </p>
                  )}
                  {claim.verificationDocsUrl && (
                    <a
                      href={claim.verificationDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-orange-600 hover:underline block mt-0.5"
                    >
                      View Submitted Documents ↗
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleClaimAction(claim.id, "APPROVE")}
                    disabled={loadingId === claim.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verify & Grant Access</span>
                  </button>
                  <button
                    onClick={() => handleClaimAction(claim.id, "REJECT")}
                    disabled={loadingId === claim.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
