import React from "react";
import prisma from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Store,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  History,
  FileCheck,
} from "lucide-react";
import { AdminActionsClient } from "./admin-actions-client";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // Fetch metrics and records
  const [
    totalRestaurants,
    pendingRestaurants,
    pendingClaims,
    totalUsers,
    totalReviews,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.restaurant.count({ where: { deletedAt: null } }),
    prisma.restaurant.findMany({
      where: { status: "PENDING_APPROVAL", deletedAt: null },
      include: { location: true },
      take: 10,
    }),
    prisma.ownerClaim.findMany({
      where: { status: "PENDING" },
      include: {
        restaurant: true,
        user: { select: { id: true, name: true, email: true } },
      },
      take: 10,
    }),
    prisma.user.count(),
    prisma.review.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: "desc" },
      include: {
        actor: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-700 font-bold uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Moderation Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Platform Moderation & Audits
              </h1>
            </div>

            <div className="text-xs text-stone-500">
              Welcome, <span className="font-bold text-stone-800">{session.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500">Total Restaurants</span>
            <div className="text-2xl font-black text-stone-900 mt-1">{totalRestaurants}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
            <span className="text-xs font-semibold text-amber-800">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-700 mt-1">{pendingRestaurants.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-orange-200 bg-orange-50/30 shadow-sm">
            <span className="text-xs font-semibold text-orange-800">Owner Claims</span>
            <div className="text-2xl font-black text-orange-700 mt-1">{pendingClaims.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500">Registered Users</span>
            <div className="text-2xl font-black text-stone-900 mt-1">{totalUsers}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500">Total Reviews</span>
            <div className="text-2xl font-black text-stone-900 mt-1">{totalReviews}</div>
          </div>
        </div>

        {/* Interactive Moderation Actions */}
        <AdminActionsClient
          pendingRestaurants={pendingRestaurants}
          pendingClaims={pendingClaims}
        />

        {/* Audit Log History Section */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <History className="w-5 h-5 text-stone-600" />
            <h3 className="font-bold text-base text-stone-900">Recent Admin Audit Logs</h3>
          </div>

          <div className="space-y-3">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 text-xs text-stone-700 border border-stone-100"
              >
                <div>
                  <span className="font-bold text-stone-900">{log.action}</span>
                  <span className="text-stone-400 mx-2">•</span>
                  <span>Entity: {log.entityType} ({log.entityId.slice(0, 8)})</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Actor: {log.actor?.name || "System"} ({log.ipAddress || "127.0.0.1"})
                  </p>
                </div>
                <div className="text-stone-400 text-[11px] shrink-0">
                  {new Date(log.timestamp).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
